import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { SupabaseService } from '../supabase/supabase.service';

function parseFeedback(text: string): {
  score: number | null;
  calories: number | null;
  feedback: string;
} {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : text);
    return {
      score: parsed.score ?? null,
      calories: parsed.calories ?? null,
      feedback: parsed.feedback ?? text,
    };
  } catch {
    return { score: null, calories: null, feedback: text };
  }
}

@Injectable()
export class FoodService {
  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async analyzeForUser(foodLogId: string, accessToken: string) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'Todavía no hay una ANTHROPIC_API_KEY configurada en el backend.',
      );
    }

    const client = this.supabaseService.getClient();

    const { data: userData, error: userError } = await client.auth.getUser(accessToken);
    if (userError || !userData.user) {
      throw new UnauthorizedException('Sesión inválida.');
    }

    const { data: foodLog, error: foodLogError } = await client
      .from('food_logs')
      .select('id, user_id, image_url')
      .eq('id', foodLogId)
      .single();

    if (foodLogError || !foodLog || foodLog['user_id'] !== userData.user.id) {
      throw new NotFoundException('Registro de comida no encontrado.');
    }

    const imageResponse = await fetch(foodLog['image_url']);
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const mediaType = imageResponse.headers.get('content-type') || 'image/jpeg';

    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as
                  | 'image/jpeg'
                  | 'image/png'
                  | 'image/webp'
                  | 'image/gif',
                data: imageBuffer.toString('base64'),
              },
            },
            {
              type: 'text',
              text:
                'Eres un nutricionista breve y directo. Mira esta foto de comida y estima ' +
                'la porción a simple vista. Responde en español, en JSON puro sin markdown ni ' +
                'texto extra, con este formato exacto: {"score": <número del 1 al 10>, ' +
                '"calories": <estimado de calorías totales de la porción, solo el número>, ' +
                '"feedback": "<2-3 frases: qué está bien de esta comida y qué corregir la ' +
                'próxima vez>"}. Si de verdad no puedes estimar las calorías, usa null en ese campo.',
            },
          ],
        },
      ],
    });

    const textBlock = message.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text',
    );
    const { score, calories, feedback } = parseFeedback(textBlock?.text ?? '');

    const { data: updated, error: updateError } = await client
      .from('food_logs')
      .update({
        ai_score: score,
        calories,
        ai_feedback: feedback,
        analyzed_at: new Date().toISOString(),
      })
      .eq('id', foodLogId)
      .select('*')
      .single();

    if (updateError) {
      throw updateError;
    }

    return updated;
  }
}
