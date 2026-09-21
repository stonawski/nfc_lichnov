export type HistoricalPlayerStat = {
  name: string
  goals: number
  matches: number
  sourceOrder: number
}

export type HistoricalSeason = {
  ordinal: number
  season: string
  matches: number
  record: string
  score: string
  points: number
  competition: string
  position: number
  incomplete?: boolean
}

const PLAYER_STATS_RAW = "Michna Jiří|18|609\nBabinec Radim|33|563\nKašpárek Antonín|162|540\nKahánek Mojmír|18|533\nGold Josef|24|479\nDrozd Pavel|11|472\nDrozd Miroslav|22|453\nPustějovský Lubomír|7|423\nMrkvan Rastislav|24|417\nKupčák Milan|3|364\nKandráč Milan|3|347\nPříhoda Petr (st.)|53|335\nLaga Jiří|0|335\nTichavský Petr|105|334\nBeneš Jiří|126|331\nMynář Miroslav|6|324\nMamula Petr|0|305\nBartoš Gunter|3|292\nŠudák Radim|124|285\nKlimeš Ondřej|68|284\nDrozd Jaromír|26|284\nSuda Pavel|59|280\nDrozd Zdeněk|3|264\nFreisler Petr|32|256\nFiala Jiří|4|250\nBumbalík Karel|66|247\nOsterezy Pavel|11|246\nChlebek Tomáš|17|238\nDrozd Ladislav|17|236\nKečkeš Zdeněk|18|235\nVaněk Ladislav (st.)|3|234\nMechl Ladislav|20|231\nNeckář Jan|26|220\nŠpaček Vladimír|15|216\nTrompisch Eduard|2|212\nČapka Jaroslav|23|211\nHanzelka Radek|29|205\nOstrý Zdeněk|19|201\nKlimek Adam|2|199\nVrobel Miroslav|28|198\nPříhoda Petr (ml.)|14|197\nMasnica Pavel|95|192\nHykl Tomáš|9|191\nPolášek Luděk|41|187\nŠpaček Martin|27|183\nIng. Kahánek Jaromír|52|180\nDrozd Petr|3|179\nGilar Jan|0|176\nStonawski Daniel|6|174\nPustějovský Jan|0|174\nZeman Marek|35|172\nBabič Květoslav|9|162\nBelica Jano|0|158\nPacal Jiří|4|157\nKocurek František|5|155\nPalo František|112|153\nIng. Tichavský Dušan|1|149\nPetr Jiří|9|147\nChytil Ladislav|18|145\nHolík Milan|13|145\nSpíšek Boh.|4|145\nPolívka Antonín|2|144\nPančocha Karel|54|142\nLichnovský Libor|4|142\nIng. Fajkus Zd.|7|141\nDrozd Tomáš|2|141\nVaverka Roman|9|140\nBabinec Jara|19|139\nGold Petr|8|137\nVeselka Lubomír|0|132\nKocourek Karel|7|130\nKohut Igor|12|128\nChlebek Richard|8|127\nDobečka Zd.|1|127\nPustějovský Zdeněk|0|127\nBendik Milan|40|126\nKlečanský Marek|13|125\nKoudelák Jara|0|124\nŽaček Petr|13|123\nDědík Lukáš|50|120\nDamek Dalibor|10|117\nVeselka Josef|54|116\nBorsík Alois|12|114\nJeřábek Lubomír|4|114\nŠvrček David|14|112\nRůžička Michal|25|105\nKahánek Luďa|2|102\nHavrlant Radomír|8|101\nBeňo Pavel|4|100\nHolub Přemysl|3|97\nŠpaček Alois|1|96\nRypár Ivo|1|95\nRůžička Tomáš|0|92\nPustějovský Martin|4|88\nJanák Jakub|7|87\nChromečka Ondřej|24|86\nKudělka Tomáš|12|86\nRobeš Daniel|3|85\nŠpaček Svaťa|0|85\nKučera Jan|2|84\nRaška Jaromír|23|83\nDočkalík Roman|4|83\nBauman Petr|4|82\nMusil František|4|81\nHorečka Lubomír|1|78\nBřezina Vlasta|4|77\nMíček Martin|3|76\nGerlich Čestmír|2|76\nWeber Jaromír|0|75\nMičulka Petr|0|75\nDobečka Lub.|0|74\nŠvrček Zdeněk|0|73\nHorečka Čestmír|0|73\nDrozd Jiří|0|73\nSkyba Ladislav|7|71\nHarabiš Kamil|2|70\nKvita Jaroslav|0|70\nMikunda Jiří|0|69\nMarek Jiří|27|67\nBožík Miroslav|3|67\nKlimeš Jan|0|67\nHořelka Václav|16|66\nŠpaček Petr ťop|0|65\nHarabiš Lubomír|1|63\nŠimek Radim|11|62\nOlšák Miroslav|0|62\nTichavský Oldřich|7|61\nPohlídal Karel|0|61\nKohut Karel|0|61\nGrossmann Lubomír|8|60\nHrnčárek Martin|7|60\nZelínka Vladislav|3|60\nLaga Radek|0|60\nŠablatura Pavel|4|58\nBusek Martin|11|57\nStonawski Tomáš|7|56\nŠpaček Jaroslav|0|56\nCachnin Pavel|1|55\nHorák Roman|19|54\nSedlář Roman|4|54\nRek Jan|0|54\nČech Marian|0|54\nSatek Jiří|17|53\nKovalík Jan|13|53\nBajer Jaroslav|0|52\nLanger Miroslav|0|51\nKlimek Pavel|4|50\nŠpaček Michal|1|50\nLacina Jaroslav|8|49\nGraniák Milan|2|48\nReibenspiess Leon|0|48\nKrpec Přemek|33|47\nPluta Zdeněk|9|47\nKřížek Lukáš|2|47\nHess Jaroslav|0|47\nFraňo Petr|9|46\nStanislav Jiří|2|46\nVašek Roman|2|45\nPleskot Pavel|1|45\nPavlík Josef|1|45\nHyvnar Josef|0|45\nTakač Daniel|0|44\nHala Petr|0|44\nLošák Aleš|9|43\nMachala Tomáš|7|43\nHolub Lubomír|1|43\nKahánek Martin|6|42\nPustějovský Miroslav|0|42\nStrnka Michal|1|41\nJanovský Dominik|0|41\nNeusehl Dalalibor|4|40\nHebelka Patrik|4|40\nŠpaček Radim|2|40\nŠpaček Zdeněk|0|40\nMacíček Marek|10|39\nPustějovský Vojtěch|2|39\nVaněček Fr.|0|39\nŠtěpán Milan|7|37\nJoukl Václav|5|37\nTobiáš Luďa|1|37\nTuroň Michael|0|37\nMelčák David|0|37\nMalota Lub.|0|37\nBartoš Roman|7|36\nHrazdílek Petr|4|36\nFukala Pavel|3|36\nPeiger Lumír|1|36\nČernoch Jan|1|36\nDeml Martin|0|36\nMyšinský Marek|11|35\nKofroň Jaroslav|1|35\nŠíma Marián|0|35\nHess Jaroslav|0|35\nSvoboda Milan|5|34\nKulhánek Radim|0|34\nGuttler Otta|0|34\nBeňo Tomáš|0|34\nHála František|9|33\nVyvial Miroslav|6|33\nOkřesík Petr|5|33\nKordoš Adam|1|33\nVeselka Oldřich|0|33\nLípový Ondřej|0|33\nDaňhel Jan|1|32\nWeber Pavel|0|32\nSvoboda Lubomír|0|32\nHanzelka Jan|4|31\nHorský Radek|0|31\nMakový Marek|3|30\nBača Pavel|2|30\nNohel Petr|1|30\nVaněk Lad. (ml.)|0|30\nHajnik Lukáš|2|29\nKlučka Lukáš|1|29\nSchindler Milan|0|29\nSlanina Lukáš|7|28\nPříhoda Radek|0|28\nMičulka Pavel|0|28\nGajdoš Jan|0|28\nAdamský Oldřich|5|27\nPrchal Karel|4|27\nPříhoda Zdeněk|0|27\nKubaník Lukáš|0|26\nTopoli Rudolf|3|25\nŠudák Slavomír|3|25\nOkřesík Jan|2|25\nSvoboda Marian|1|25\nPetráš Radek|1|25\nKučera Adam|1|25\nKozelský Vladimír|0|25\nŠtěpán Jiří|2|24\nMichálek Patrik|2|24\nKlos Jan|2|24\nKošárek Miroslav|19|23\nŠtula Jan|4|23\nNavrátil Jan|2|23\nKrakovský Michal|2|23\nEnčev Radek|2|23\nMelčák Viktor|1|23\nStrnadel Jan|0|23\nKupčák Radan|0|23\nDobečka Vlasta|0|23\nČervenka Pavel|0|23\nBlažek Aleš|0|23\nTobiáš Petr|7|22\nPalacký Adam|5|22\nKaizrlich Pavel|4|22\nHebelka David|4|22\nDostál Filip|4|22\nNeuwirth Milič|0|22\nKašpárek Jiří|0|22\nHruška Roman|7|21\nPriesol Stanislav|5|21\nRek Pavel|0|21\nBřezina Radek|4|20\nMarek Petr|1|20\nKřupala Petr|1|20\nJalůvka Roman|0|20\nZávodný Jiří|7|19\nJaniak Marián|7|19\nSíbrt Jan|6|19\nVerlich Zdeněk|2|19\nKašpárek Rad.|0|19\nKalich Jan|4|18\nMacoun Jaroslav|4|17\nToška Jakub|3|17\nGazda Tomáš|3|17\nMartiňák Břetislav|2|17\nHoffman Martin|0|17\nNenutil Tomáš|1|16\nMinsk David|1|16\nHanko Michal|1|16\nHorečka Viliám|0|16\nČapka Zdeněk|0|16\nHrabovský Miroslav|8|15\nMatonoha Stanislav|2|15\nKahánek Richard|0|15\nMichálek Jan|3|14\nMach Matěj|1|14\nKryzmánek Martin|0|14\nJurek Vilém|1|13\nBurián David|1|13\nTobiáš Jiří|0|13\nSuda Jan|0|13\nSluka Štěpán|0|13\nPolomský Michal|0|13\nKahánek Přemysl|0|13\nHolub Jaroslav|0|13\nDrozd Lukáš|0|13\nChromečka Tomáš|1|12\nBlažek Jan|1|12\nBezděk Lukáš|1|12\nToman Miroslav|0|12\nTobiáš Libor|0|12\nLacina Mir.|0|12\nČuport Alex|0|12\nCóka Eugen|0|12\nBiolek Martin|0|12\nMalúš Jiří|5|11\nHanzelka Radek r.1986|2|11\nŠpaček Jiří (ml.)|0|11\nOllender Martin|0|11\nKocián Karel|0|11\nKelnár|0|11\nBílek Jakub|0|11\nŽabenský Jan|0|10\nŠpaček Petr|0|10\nŠereš Vojtech|0|10\nPeiger Tomáš|0|10\nKunc Jakub|0|10\nKrupa Jiří|0|10\nKramoliš Pavel|0|10\nJalůvka Vladan|0|10\nHanus Adam|0|10\nMelčák Zbyněk|5|9\nKundl Josef|2|9\nŠulák Pavel|1|9\nZátopek Libor|0|9\nŠpaček Petr lakýrník|0|9\nŠálek Dalibor|0|9\nRůžička Pavel|0|9\nNeusekl Zdeněk|0|9\nHykel Přemysl|0|9\nDvořák Petr|0|9\nRaška Adam|5|8\nGajdušek Daniel|3|8\nBoháč Václav|3|8\nNavrátil Josef|2|8\nKučera David|2|8\nHrubý Jakub|1|8\nVlček Lukáš|0|8\nPokluda Bedřich|0|8\nKurečka Marcel|0|8\nHorvát František|0|8\nBurýšek Lukáš|6|7\nGrossmann Dominik|1|7\nŠpaček Zbyněk|0|7\nŠpaček Jan|0|7\nRadek Petr|0|7\nMynář Pavel|0|7\nKlimsza Bronislav|0|7\nKalina Mikuláš|0|7\nHrňa Petr|0|7\nBordovský Filip|0|7\nHubeňák Lukáš|2|6\nTichavský Miroslav|1|6\nŠvasta Michal|0|6\nSkyba Stanislav|0|6\nRys Jara|0|6\nKahánek Vlasta|0|6\nHolík Jara (ml.)|0|6\nDušek Petr|0|6\nBača Jara|0|6\nZlý Adam|0|5\nStrnadel Leo|0|5\nPavelec Martin|0|5\nMajer Vojtěch|0|5\nKučera R.|0|5\nGilar Lukáš|0|5\nFojtášek Robin|0|5\nFigala Pavel|0|5\nDorňák Don.|0|5\nCsaba Csomes|0|5\nAntoš Patrik|0|5\nZahradník Ondřej|1|4\nZbranek Petr|0|4\nVeselý Jakub|0|4\nUrbančík Denis|0|4\nTroškovič Jara|0|4\nŠvrček Stan.|0|4\nŠpaček Mir.|0|4\nSchindler Václav|0|4\nPustějovský Jiří|0|4\nPetráš Tomáš|0|4\nPavliščik|0|4\nMatúš Michal|0|4\nKupčák Martin|0|4\nKuchta Lukáš|0|4\nIng. Demel Mir.|0|4\nChalupa Jan|0|4\nHlinka|0|4\nČeladnik Martin|0|4\nSocha Čeňek|0|3\nSlezák Rostislav|0|3\nPlaček Jaroslav|0|3\nOndruš Juraj|0|3\nFerst Petr|0|3\nBolom Petr|0|3\nBadžgoň František|0|3\nSlováček Jan|2|2\nKupčík Luboš|1|2\nŽáček Marek|0|2\nTeplárek Ivan|0|2\nŠulák Petr|0|2\nPokluda|0|2\nPavlát Ivo|0|2\nPaciorek Roman|0|2\nKocián Václav|0|2\nKlepáč Jakub|0|2\nKalich|0|2\nFojtášek Dan|0|2\nFizik Jan|0|2\nDorotík Daniel|0|2\nČižek|0|2\nSpurný Martin|1|1\nMacháček Matyáš|1|1\nVávra Radek|0|1\nVaňek Miroslav|0|1\nŠmíd Otta|0|1\nŠindler (ml.)|0|1\nSokolovský|0|1\nRydzák František|0|1\nPavlát Ondra|0|1\nMikulenda|0|1\nMaléř Petr|0|1\nMak Josef.|0|1\nKupka|0|1\nKučera Tomáš|0|1\nKoval|0|1\nKoudela|0|1\nKočíř Jiří|0|1\nKnoll Radek|0|1\nKašpárek Lukáš|0|1\nKalus|0|1\nChytil Zdeněk|0|1\nHuvar Rosťa|0|1\nGalia|0|1\nČecháček|0|1\nBauman (ml.)|0|1\nAdamec Ondřej|0|1"

const SEASONS_RAW = "1|1964/65|16|10–2–4|55:26|22|4. třída|3\n2|1965/66|18|11–2–5|58:31|24|4. třída|2\n3|1966/67|22|6–6–6|43:49|18|3. třída|8\n4|1967/68|22|14–1–7|69:43|29|3. třída|2\n5|1968/69|24|10–4–10|53:42|24|Okresní přebor|7\n6|1969/70|22|8–6–8|45:39|22|Okresní přebor|6\n7|1970/71|22|9–4–9|56:46|22|Okresní přebor|5\n8|1971/72|22|14–3–5|33:22|31|Okresní přebor|2\n9|1972/73|22|14–3–5|55:29|31|Okresní přebor|1\n10|1973/74|22|6–5–11|32:36|17|1. B třída|9\n11|1974/75|22|7–1–14|22:44|15|1. B třída|10\n12|1975/76|22|8–6–8|26:29|22|1. B třída|7\n13|1976/77|22|9–5–8|34:30|23|1. B třída|7\n14|1977/78|22|7–5–10|24:33|19|1. B třída|11\n15|1978/79|22|8–5–9|31:38|21|1. B třída|8\n16|1979/80|22|6–2–14|25:47|14|1. B třída|12\n17|1980/81|26|12–4–10|56:56|28|Okresní přebor|7\n18|1981/82|26|10–6–10|51:44|26|Okresní přebor|6\n19|1982/83|26|16–5–5|61:36|37|Okresní přebor|1\n20|1983/84|26|10–7–9|47:50|27|Krajská soutěž|4\n21|1984/85|26|8–4–14|33:41|20|Krajská soutěž|10\n22|1985/86|26|9–5–12|38:54|23|Krajská soutěž|10\n23|1986/87|22|4–2–16|21:50|10|Krajská soutěž|12\n24|1987/88|26|9–6–11|34:42|24|Okresní přebor|10\n25|1988/89|26|9–5–12|41:59|22|Okresní přebor|12\n26|1989/90|26|7–7–12|40:50|21|Okresní přebor|13\n27|1990/91|26|13–8–5|47:33|34|Okresní přebor|2\n28|1991/92|26|9–4–13|42:58|22|1. B třída|12\n29|1992/93|26|8–7–11|36:49|23|1. B třída|11\n30|1993/94|26|12–7–7|47:35|31|1. B třída|3\n31|1994/95|26|18–7–1|73:20|61|1. B třída|1\n32|1995/96|26|14–3–9|50:38|45|1. A třída|3\n33|1996/97|26|11–4–11|43:32|37|1. A třída|7\n34|1997/98|26|9–5–12|36:41|32|1. A třída|8\n35|1998/99|26|16–7–3|65:35|55|1. A třída|1\n36|1999/2000|30|11–6–13|51:58|39|Župní přebor SFŽ|9\n37|2000/01|30|12–6–12|60:63|42|Župní přebor SFŽ|8\n38|2001/02|30|14–5–11|55:49|47|Župní přebor SFŽ|4\n39|2002/03|30|15–7–8|62:38|52|Krajský přebor|3\n40|2003/04|30|14–11–5|63:38|53|Krajský přebor|3\n41|2004/05|30|10–6–14|54:51|36|Krajský přebor|9\n42|2005/06|30|14–5–11|58:46|47|Krajský přebor|4\n43|2006/07|30|11–5–14|41:66|38|Krajský přebor|11\n44|2007/08|30|0–1–29|28:120|1|Krajský přebor|16\n45|2008/09|26|0–1–25|9:108|1|1. A třída|14\n46|2009/10|26|6–6–14|36:62|24|1. B třída|11\n47|2010/11|26|12–3–11|42:47|39|1. B třída|6\n48|2011/12|26|9–4–13|44:67|31|1. B třída|10\n49|2012/13|26|4–3–19|31:81|15|1. B třída|14\n50|2013/14|26|8–6–12|49:61|30|Okresní přebor|10\n51|2014/15|26|14–3–9|79:52|46|Okresní přebor|7\n52|2015/16|26|9–0–17|40:64|29|Okresní přebor|11\n53|2016/17|26|14–0–12|59:52|44|Okresní přebor|5\n54|2017/18|26|17–0–9|87:57|47|Okresní přebor|4\n55|2018/19|26|10–2–1–13|42:53|35|Okresní přebor|10\n56|2019/20|13|3–1–1–8|24:35|12|Okresní přebor|13\n57|2020/21|9|5–0–1–3|20:17|16|Okresní přebor|4\n58|2021/22|26|6–1–2–17|42:70|22|Okresní přebor|14\n59|2022/23|13|9–2–0–2|51:25|31|3. třída|2"

export const historicalPlayerStats: HistoricalPlayerStat[] = PLAYER_STATS_RAW
  .trim()
  .split('\n')
  .map((row, index) => {
    const [name, goals, matches] = row.split('|')
    return {
      name,
      goals: Number(goals),
      matches: Number(matches),
      sourceOrder: index + 1,
    }
  })

export const historicalSeasons: HistoricalSeason[] = SEASONS_RAW
  .trim()
  .split('\n')
  .map((row) => {
    const [ordinal, season, matches, record, score, points, competition, position] = row.split('|')
    return {
      ordinal: Number(ordinal),
      season,
      matches: Number(matches),
      record,
      score,
      points: Number(points),
      competition,
      position: Number(position),
      incomplete: season === '2019/20' || season === '2020/21',
    }
  })

export const competitionMilestones = [
  { afterSeason: '1965/66', type: 'promotion', from: '4. třída', to: '3. třída' },
  { afterSeason: '1967/68', type: 'promotion', from: '3. třída', to: 'Okresní přebor' },
  { afterSeason: '1972/73', type: 'promotion', from: 'Okresní přebor', to: '1. B třída' },
  { afterSeason: '1979/80', type: 'relegation', from: '1. B třída', to: 'Okresní přebor' },
  { afterSeason: '1982/83', type: 'promotion', from: 'Okresní přebor', to: 'Krajská soutěž' },
  { afterSeason: '1986/87', type: 'relegation', from: 'Krajská soutěž', to: 'Okresní přebor' },
  { afterSeason: '1990/91', type: 'promotion', from: 'Okresní přebor', to: '1. B třída' },
  { afterSeason: '1994/95', type: 'promotion', from: '1. B třída', to: '1. A třída' },
  { afterSeason: '1998/99', type: 'promotion', from: '1. A třída', to: 'Župní přebor SFŽ' },
  { afterSeason: '2007/08', type: 'relegation', from: 'Krajský přebor', to: '1. A třída' },
  { afterSeason: '2008/09', type: 'relegation', from: '1. A třída', to: '1. B třída' },
  { afterSeason: '2012/13', type: 'relegation', from: '1. B třída', to: 'Okresní přebor' },
  { afterSeason: '2021/22', type: 'relegation', from: 'Okresní přebor', to: '3. třída' },
] as const
