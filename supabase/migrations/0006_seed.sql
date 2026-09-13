-- Pleroma — 0006_seed  (OPTIONAL)
-- A few published education entries so "Traditions" isn't empty on first run.
-- Safe to re-run: each row is skipped if a content item with the same title
-- already exists. Matches the content_items shape from 0002_tables.sql
-- (category in ('ritual','nde'), region, youtube_url).
--
-- Body text uses dollar-quoted string literals ($body$ ... $body$) so
-- apostrophes need no escaping and the SQL survives copy/paste. Paragraphs are
-- real blank lines (the education page splits the body on blank lines).

insert into public.content_items (category, title, body, region, youtube_url, published)
select * from (values
  (
    'ritual',
    'Día de los Muertos: the ofrenda',
    $body$In Mexican tradition, families build an ofrenda — an altar layered with photographs, marigolds (cempasúchil), candles, water, and the favorite foods of those who have died. The marigold's scent and color are said to guide spirits home for a night of welcome rather than mourning. The ritual reframes death as continuity: the dead are not gone so much as expected, once a year, as guests.

Building an altar is itself a form of remembering — choosing what to place on it asks the living to recall who someone truly was.$body$,
    'Mexico',
    null,
    true
  ),
  (
    'ritual',
    'Sitting shiva',
    $body$In Jewish tradition, the seven days following a burial are known as shiva. Mourners stay home and the community comes to them — bringing food, sitting quietly, and letting the bereaved speak or stay silent as they need. Mirrors are often covered and ordinary vanity set aside. The structure gives grief a container: a defined time, a gathered circle, and permission to do nothing but mourn.

Shiva's wisdom is that grief is not carried alone, and that presence matters more than words.$body$,
    'Jewish tradition · Global',
    null,
    true
  ),
  (
    'ritual',
    'Obon: lanterns on the water',
    $body$Obon is a Japanese Buddhist observance welcoming ancestral spirits back to the world of the living. Families clean graves, offer food, and dance the Bon Odori. At its close, tōrō nagashi sends paper lanterns floating down rivers and out to sea, lighting the spirits' way back. The image — small flames drifting into the dark — is one of the gentlest in any mourning tradition.

Many cultures mark passage with light. A candle, a lantern, a flame kept burning: a way of saying you are not forgotten.$body$,
    'Japan',
    null,
    true
  ),
  (
    'nde',
    'What people report from near-death experiences',
    $body$Across cultures, people who have come close to death sometimes describe strikingly similar things: a sense of peace, a feeling of moving through darkness toward light, a life review, or a reluctance to return. Researchers who study these accounts treat them as meaningful human experiences worth listening to, without claiming they prove what lies beyond death.

What these reports offer the grieving is not certainty but company — the sense that the threshold between living and dying has been approached before, and often met with calm rather than terror.$body$,
    'Global',
    'https://www.youtube.com/watch?v=xdMPuBQXTfg',
    true
  )
) as v(category, title, body, region, youtube_url, published)
where not exists (
  select 1 from public.content_items c where c.title = v.title
);
