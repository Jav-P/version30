-- Link de video de técnica correcta por ejercicio, para que cada quien pueda
-- revisar la forma correcta directo desde la app durante el entrenamiento.

alter table routine_exercises add column video_url text;

update routine_exercises set video_url = 'https://www.youtube.com/watch?v=GeLq8cMODLc' where name = 'Press banca con barra';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=5CtaciJn9uY' where name = 'Press militar sentado';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=oTD5g77GgSA' where name = 'Press inclinado con mancuernas';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=b6KtNTSHA54' where name = 'Elevaciones laterales';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=gMrHeqWTikc' where name = 'Fondos en paralelas';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=HAS8uy73HqM' where name = 'Extensión de tríceps en polea';

update routine_exercises set video_url = 'https://www.youtube.com/watch?v=44iTFW8f2HE' where name = 'Peso muerto convencional';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=myYYGyQKLz8' where name = 'Dominadas o jalón al pecho';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=12AQkpfSN9E' where name = 'Remo con barra';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=X-xCQ1gh-kA' where name = 'Face pull';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=jkwxFce71ao' where name = 'Curl con barra Z';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=K6Go66ZjAjc' where name = 'Curl martillo';

update routine_exercises set video_url = 'https://www.youtube.com/watch?v=dsCuiccYNGs' where name = 'Sentadilla con barra';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=hl-EJUQ2yuc' where name = 'Prensa de piernas';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=EPARQLIYrZU' where name = 'Zancadas caminando';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=ndnA6yvGoqQ' where name = 'Extensión de cuádriceps';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=_R3TOH-vnF8' where name = 'Elevación de talones de pie';

update routine_exercises set video_url = 'https://www.youtube.com/watch?v=WREUHExSxDc' where name = 'Press militar de pie con barra';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=RkveusFgV30' where name = 'Press inclinado con barra';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=W7Nc-p7wR4Q' where name = 'Aperturas en polea o máquina';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=BIca6STWIXQ' where name = 'Press francés';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=dlA8DTO-Zro' where name = 'Press cerrado en banca';

update routine_exercises set video_url = 'https://www.youtube.com/watch?v=myYYGyQKLz8' where name = 'Dominadas lastradas o jalón agarre ancho';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=2anoS6A5DrU' where name = 'Remo en máquina o remo en T';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=fZYGcNtMWSc' where name = 'Remo con mancuerna a una mano';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=X-xCQ1gh-kA' where name = 'Face pull o pájaro';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=ur1BZ7zAZvA' where name = 'Curl en banco Scott';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=8B0mY3gknoc' where name = 'Curl concentrado';

update routine_exercises set video_url = 'https://www.youtube.com/watch?v=ZiO69NlLlYo' where name = 'Peso muerto rumano';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=9xbBr5Ytl8c' where name = 'Curl femoral';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=aMntMBkmv0g' where name = 'Hip thrust';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=imWey1JId4g' where name = 'Zancada búlgara';
update routine_exercises set video_url = 'https://www.youtube.com/watch?v=Hq7ZnmkuZWM' where name = 'Elevación de talones sentado';
