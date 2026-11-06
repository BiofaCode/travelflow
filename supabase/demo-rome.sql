-- Voyage de démo "Week-end à Rome" : 4 jours, 16 étapes, pour montrer l'appli
-- (couleurs par jour sur la carte, photos des lieux, trajets, budget...)
--
-- Comment l'utiliser :
-- 1. Supabase > ton projet TravelFlow > SQL Editor > New query
-- 2. colle tout ce fichier
-- 3. remplace l'e-mail juste en dessous par celui de TON compte TravelFlow
-- 4. Run
--
-- On peut le relancer : il supprime d'abord l'ancien voyage de démo (même titre)
-- L'éditeur SQL tourne en admin, donc il passe outre les policies RLS :
-- c'est pour ça qu'on doit donner le user_id nous-mêmes

do $$
declare
  mon_email text := 'fabio.sampaolo@rpn.ch'; -- <- à changer
  mon_id uuid;
  voyage_id bigint;
begin
  select id into mon_id from auth.users where email = mon_email;
  if mon_id is null then
    raise exception 'Aucun compte avec l''e-mail %', mon_email;
  end if;

  -- les étapes partent avec (on delete cascade)
  delete from trips where user_id = mon_id and titre = 'Week-end à Rome (démo)';

  insert into trips (user_id, titre, destination, date_debut, date_fin, budget_total, voyageurs)
  values (mon_id, 'Week-end à Rome (démo)', 'Rome, Italie', '2026-11-18', '2026-11-21', 900, 2)
  returning id into voyage_id;

  -- les titres sont ceux de Wikipédia quand c'est possible : l'appli retrouve
  -- comme ça la photo du lieu (onglet Explorer / lieux populaires)
  insert into steps (trip_id, jour, heure, titre, notes, cout, latitude, longitude) values
    -- jour 1 : la Rome antique
    (voyage_id, '2026-11-18', '08:30', 'Gare de Rome-Termini', 'Arrivée en train, poser les valises à l''hôtel.', 0, 41.9010, 12.5016),
    (voyage_id, '2026-11-18', '10:00', 'Colisée', 'Billet combiné Colisée + Forum + Palatin, réservé en ligne.', 36, 41.8902, 12.4922),
    (voyage_id, '2026-11-18', '12:00', 'Forum romain', '', 0, 41.8925, 12.4853),
    (voyage_id, '2026-11-18', '13:30', 'Mont Palatin', 'Vue sur le Circus Maximus.', 0, 41.8894, 12.4875),
    (voyage_id, '2026-11-18', '15:30', 'Bouche de la Vérité', 'Petite queue, prévoir 20 min.', 0, 41.8881, 12.4814),
    (voyage_id, '2026-11-18', '20:00', 'Souper à l''hôtel', 'Pas encore choisi le resto (pas sur la carte).', 45, null, null),
    -- jour 2 : le Vatican
    (voyage_id, '2026-11-19', '09:00', 'Musées du Vatican', 'Chapelle Sixtine à la fin, pas de photos dedans.', 40, 41.9065, 12.4536),
    (voyage_id, '2026-11-19', '13:00', 'Basilique Saint-Pierre', 'Monter à la coupole (551 marches).', 20, 41.9022, 12.4539),
    (voyage_id, '2026-11-19', '16:00', 'Château Saint-Ange', '', 32, 41.9031, 12.4663),
    (voyage_id, '2026-11-19', '19:30', 'Trastevere', 'Souper dans les ruelles.', 60, 41.8897, 12.4694),
    -- jour 3 : le centre historique
    (voyage_id, '2026-11-20', '09:30', 'Panthéon', '', 10, 41.8986, 12.4769),
    (voyage_id, '2026-11-20', '11:00', 'Piazza Navona', 'Glace chez Tre Scalini.', 8, 41.8992, 12.4731),
    (voyage_id, '2026-11-20', '12:30', 'Campo de'' Fiori', 'Marché le matin, pizza al taglio à midi.', 15, 41.8956, 12.4722),
    (voyage_id, '2026-11-20', '15:00', 'Fontaine de Trevi', 'Lancer une pièce !', 0, 41.9009, 12.4833),
    (voyage_id, '2026-11-20', '17:00', 'Place d''Espagne', 'Coucher de soleil en haut des marches.', 0, 41.9058, 12.4823),
    -- jour 4 : parc puis retour
    (voyage_id, '2026-11-21', '10:00', 'Villa Borghèse', 'Balade + Galerie Borghèse (réserver avant).', 30, 41.9142, 12.4923);
end $$;
