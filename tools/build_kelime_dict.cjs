const fs = require('fs');
const path = require('path');

// Temel popüler Türkçe kelime kökleri ve ekleri (3-9 harfli)
const BASE_TURKISH_WORDS = [
  // 3 Harfli
  "ADA","AĞA","AKŞ","ALİ","ALT","ANI","ARI","ARK","ARP","ART","AŞI","AŞK","ATE","AYI","BAL","BAR","BAŞ","BAT","BAY","BEL","BEN","BEŞ","BEY","BİR","BİZ","BOŞ","BOY","BOZ","BUZ","CAM","CAN","CAZ","CEB","CEP","CİN","ÇAL","ÇAM","ÇAP","ÇAY","ÇEK","ÇİL","ÇİM","ÇİP","ÇÖL","ÇÖP","DAĞ","DAL","DAM","DAR","DAV","DEM","DEV","DİK","DİL","DİN","DİŞ","DİZ","DOL","DON","DOZ","DUA","DUL","DUT","DUŞ","DÜN","DÜZ","EBE","ECE","EFE","EGE","EKO","ELA","ELE","ELİ","ERİ","ERK","ERT","ESİ","EŞİ","ETA","EVİ","EZİ","FAK","FAL","FAR","FAS","FAY","FAZ","FEN","FER","FES","FİL","FİŞ","FİT","FOL","FON","FOS","FUL","FUT","GAG","GAH","GAL","GAM","GAR","GAZ","GEÇ","GEL","GEN","GEZ","GÖK","GÖL","GÖZ","GÜÇ","GÜL","GÜN","GÜR","GÜZ","HAC","HAK","HAL","HAM","HAN","HAP","HAR","HAS","HAT","HAV","HAY","HAZ","HEM","HEP","HER","HEY","HIZ","HİÇ","HİS","HİT","HOŞ","HÖY","HUN","HUY","HÜZ","ILK","IRK","IRZ","ISI","IŞI","İBİ","İÇİ","İDİ","İĞE","İKİ","İLE","İLK","İMA","İNÇ","İNE","İPİ","İRİ","İRS","İSE","İSİ","İŞİ","İTE","İTİ","İYİ","İZE","JEL","JET","JİP","JÖL","JÜT","KAÇ","KAH","KAL","KAM","KAN","KAP","KAR","KAS","KAŞ","KAT","KAV","KAY","KAZ","KEÇ","KEF","KEK","KEL","KEM","KEP","KER","KES","KEŞ","KIL","KIR","KIŞ","KIT","KIZ","KİK","KİL","KİM","KİP","KİR","KİT","KOD","KOF","KOK","KOL","KOM","KON","KOR","KOŞ","KOT","KOY","KOZ","KÖK","KÖL","KÖM","KÖP","KÖR","KÖS","KÖŞ","KÖY","KÖZ","KUL","KUM","KUP","KUR","KUŞ","KUT","KUY","KUZ","KÜÇ","KÜF","KÜL","KÜP","KÜR","KÜS","KÜT","LAK","LAL","LAM","LAN","LAP","LAV","LAZ","LEF","LEH","LER","LEŞ","LİF","LİG","LİM","LİP","LİRA","LİS","LOK","LOP","LOR","LOŞ","LOT","LÖP","LÖS","LUF","LUT","LÜK","MAÇ","MAL","MAN","MAR","MAS","MAŞ","MAT","MAY","MAZ","MEÇ","MEN","MER","MEŞ","MEY","MIH","MIM","MIR","MİÇ","MİF","MİL","MİM","MİR","MİS","MİT","MOF","MOL","MOM","MOP","MOR","MOZ","MUÇ","MUH","MUK","MUM","MUŞ","MUT","MUZ","MÜH","MÜL","MÜS","MÜZ","NAL","NAM","NAN","NAR","NAS","NAŞ","NAT","NAZ","NEF","NEM","NET","NEY","NİÇ","NİF","NİG","NİL","NİM","NİŞ","NOD","NOT","NUH","NUR","NÜF","NÜK","NÜS","OBA","OBU","ODA","OHA","OJE","OKA","OKS","OLA","OLE","OLU","OMA","ONA","ONS","ORA","ORU","OTA","OTO","OVA","OYA","ÖCE","ÖÇÜ","ÖDE","ÖĞE","ÖKE","ÖKÜ","ÖLE","ÖLÜ","ÖMÜ","ÖNÜ","ÖPÜ","ÖRE","ÖRT","ÖSE","ÖTE","ÖVE","ÖZE","ÖZÜ","PAÇ","PAK","PAL","PAS","PAŞ","PAT","PAY","PAZ","PEÇ","PEK","PER","PES","PEŞ","PEY","PIÇ","PIR","PIS","PİÇ","PİK","PİL","PİM","PİR","PİS","PİT","PİY","POF","POK","POL","POM","POP","POR","POS","POT","POZ","PÖÇ","PÖF","PÖR","PUF","PUL","PUN","PUS","PUŞ","PUT","PÜF","PÜP","PÜR","PÜS","RAF","RAM","RAP","RAS","RAY","RAZ","REÇ","REF","REK","REM","RES","REY","RIZ","RİF","RİK","RİM","RİN","RİP","RİS","RİT","ROD","ROF","ROL","ROM","ROŞ","ROT","RÖF","RÖP","RUF","RUH","RUK","RUM","RUN","RUS","RUT","RÜZ","SAÇ","SAF","SAĞ","SAK","SAL","SAM","SAN","SAP","SAR","SAS","SAŞ","SAT","SAV","SAY","SAZ","SEÇ","SEF","SEK","SEL","SEM","SEN","SEP","SER","SES","SET","SEV","SEY","SEZ","SIÇ","SIF","SIĞ","SIK","SIL","SIR","SIS","SIT","SIZ","SİK","SİL","SİM","SİN","SİP","SİR","SİS","SİT","SİV","SİZ","SOF","SOĞ","SOK","SOL","SOM","SON","SOP","SOR","SOS","SOY","SÖÇ","SÖĞ","SÖK","SÖL","SÖN","SÖZ","SUÇ","SUF","SUK","SUL","SUM","SUN","SUP","SUR","SUS","SUT","SUZ","SÜÇ","SÜF","SÜK","SÜL","SÜM","SÜN","SÜP","SÜR","SÜS","SÜT","SÜZ","ŞAH","ŞAK","ŞAL","ŞAN","ŞAP","ŞAR","ŞAT","ŞAY","ŞAZ","ŞEF","ŞEK","ŞEN","ŞER","ŞEŞ","ŞEY","ŞIK","ŞIK","ŞIK","ŞIP","ŞİR","ŞİŞ","ŞOK","ŞOM","ŞOR","ŞOV","ŞÖF","ŞÖL","ŞUH","ŞUR","ŞUT","ŞÜF","ŞÜM","ŞÜP","TAÇ","TAF","TAK","TAL","TAM","TAN","TAP","TAR","TAS","TAŞ","TAT","TAV","TAY","TAZ","TEF","TEK","TEL","TEM","TEN","TER","TEŞ","TEZ","TIĞ","TIK","TIN","TIP","TIR","TIS","TİK","TİL","TİM","TİN","TİP","TİR","TİZ","TOF","TOK","TOL","TOM","TON","TOP","TOR","TOS","TOY","TOZ","TÖF","TÖK","TÖL","TÖM","TÖN","TÖP","TÖS","TÖZ","TUF","TUK","TUL","TUM","TUN","TUP","TUR","TUŞ","TUT","TUZ","TÜF","TÜK","TÜL","TÜM","TÜN","TÜP","TÜR","TÜS","TÜŞ","TÜT","TÜY","TÜZ","UCA","UÇU","ULA","ULU","UMA","UMU","UNU","URA","URL","URU","USA","USÇ","UST","USU","UŞA","UZA","UZU","ÜÇÜ","ÜFE","ÜLE","ÜLÜ","ÜMÜ","ÜNÜ","ÜRE","ÜRK","ÜSE","ÜST","ÜŞÜ","ÜVE","ÜZE","ÜZÜ","VAF","VAK","VAL","VAN","VAR","VAS","VAŞ","VAT","VAY","VAZ","VEF","VEK","VER","VET","VEY","VIC","VIK","VIN","VIR","VİÇ","VİD","VİK","VİL","VİN","VİR","VİS","VİT","VİZ","VOD","VOF","VOL","VOM","VON","VOP","VOR","VOŞ","VOZ","VÖF","VÖK","VÖL","VUF","VUK","VUL","VUR","VUS","VUZ","VÜF","VÜK","VÜZ","YAB","YAÇ","YAĞ","YAH","YAK","YAL","YAM","YAN","YAP","YAR","YAS","YAŞ","YAT","YAV","YAY","YAZ","YED","YEK","YEL","YEM","YEN","YER","YES","YEŞ","YET","YEV","YEY","YEZ","YIĞ","YIK","YIL","YIP","YIR","YİĞ","YİM","YİN","YİP","YİR","YİS","YİŞ","YİT","YİV","YİZ","YOB","YOĞ","YOK","YOL","YOM","YON","YOR","YOZ","YÖK","YÖM","YÖN","YÖP","YÖS","YUK","YUL","YUM","YUN","YUR","YUS","YUT","YUV","YUZ","YÜÇ","YÜF","YÜK","YÜL","YÜM","YÜN","YÜP","YÜR","YÜS","YÜŞ","YÜZ","ZAF","ZAĞ","ZAM","ZAN","ZAR","ZAT","ZAV","ZAY","ZAZ","ZEF","ZEH","ZEM","ZEN","ZER","ZEV","ZEY","ZIK","ZIL","ZIM","ZIR","ZIT","ZİF","ZİG","ZİK","ZİL","ZİM","ZİN","ZİP","ZİR","ZİT","ZİV","ZİX","ZİZ","ZOM","ZON","ZOR","ZOS","ZOT","ZÖF","ZUF","ZUM","ZUR","ZUT","ZÜF","ZÜL","ZÜR","ZÜT"
];

// 4 Harfli Kelimeler
const WORDS_4 = [
  "ABLA","ACAR","ACİL","AÇIK","ADAK","ADAM","ADIM","ADİL","AFET","AĞAÇ","AĞIR","AĞIZ","AHIR","AİLE","AJAN","AKAR","AKIL","AKİK","AKIM","AKIN","AKİS","AKMA","AKOR","AKRO","AKSE","AKSU","AKUR","ALAN","ALAY","ALEM","ALET","ALEV","ALGI","ALIK","ALIM","ALIN","ALİŞ","ALLI","ALMA","ALTI","ALTO","AMAÇ","AMAN","AMCA","AMEL","AMİN","AMİR","ANAÇ","ANCA","ANIK","ANIT","ANIZ","ANMA","ANNE","ANON","APEL","APRE","APSE","ARAF","ARAP","ARAÇ","ARDA","ARIK","ARKA","ARLI","ARPA","ARŞI","ARUZ","ARZU","ASAL","ASAP","ASIL","ASIR","ASİL","ASKI","ASLA","ASLİ","ASMA","ASRİ","AŞÇI","AŞIK","AŞIM","AŞMA","ATAÇ","ATAK","ATAŞ","ATEL","ATEŞ","ATIF","ATIK","ATIL","ATIM","ATIŞ","ATKI","ATLI","ATMA","ATOM","AVAM","AVAZ","AVCI","AVLU","AVRO","AVUN","AYAK","AYAN","AYAR","AYAZ","AYET","AYIK","AYIN","AYIP","AYLA","AYLI","AYMA","AYNA","AYNİ","AYRI","AYVA","AZAP","AZAT","AZIK","AZİL","AZİM","AZİT","AZİZ","AZMA","AZOT","BABA","BACA","BACI","BADI","BAĞI","BAHT","BAKI","BAKİ","BALA","BALE","BALO","BANA","BANK","BANT","BARİ","BARO","BARK","BASI","BATI","BATİ","BAYİ","BEBE","BEİS","BEKA","BELE","BELİ","BENT","BERE","BERİ","BESİ","BETİ","BEZE","BİAT","BİBİ","BİCİ","BİDE","BİGA","BİLE","BİLG","BİLİ","BİNA","BİNİ","BİRA","BİRİ","BİSİ","BİTİ","BOBO","BOCA","BOĞA","BOKS","BOLU","BONO","BORÇ","BORU","BOYA","BOZA","BÖCÜ","BÖKE","BÖLE","BÖLÜ","BÖRE","BÖRK","BÖSÜ","BREŞ","BRİK","BRİÇ","BRÜT","BUAT","BUCA","BUĞU","BUJİ","BULA","BUNA","BURA","BURÇ","BURU","BUSE","BUUT","BÜFE","BÜKÜ","BÜRO","BÜST","BÜVE","BÜZÜ","CADİ","CAİZ","CAKA","CAMİ","CANA","CANİ","CARİ","CART","CEBE","CEDİ","CEFA","CELİ","CELP","CEMİ","CENK","CERH","CEVA","CEZA","CILK","CIDA","CING","CIVA","CİCİ","CİDA","CİFE","CİLA","CİLT","CİMA","CİNS","CİPS","CİRO","CİVA","CUMA","CÜCE","CÜDA","CÜZİ","ÇAÇA","ÇAĞA","ÇAKI","ÇALI","ÇAPA","ÇARE","ÇARK","ÇATI","ÇEÇE","ÇEKİ","ÇELİ","ÇENE","ÇENK","ÇERİ","ÇETE","ÇIĞA","ÇIKI","ÇIMA","ÇIPA","ÇIRA","ÇITA","ÇİÇE","ÇİFİ","ÇİLE","ÇİLL","ÇİMİ","ÇİNE","ÇİNİ","ÇİPO","ÇİSE","ÇİTİ","ÇİVİ","ÇİZE","ÇİZT","ÇOĞU","ÇUHA","DADI","DAĞİ","DAHA","DAHİ","DAİM","DAİR","DAMA","DANA","DANE","DANK","DANS","DARA","DARI","DARP","DART","DARU","DATA","DAVA","DAYI","DEBİ","DEDE","DEFA","DEFİ","DEFO","DEĞİ","DELİ","DEME","DENİ","DENK","DEPO","DERÇ","DERE","DERİ","DERK","DERS","DERT","DERZ","DEST","DEVA","DEVE","DEYİ","DIBI","DİBA","DİBİ","DİDE","DİDİ","DİFİ","DİGİ","DİJİ","DİKE","DİKİ","DİLE","DİLİ","DİMA","DİME","DİNA","DİNİ","DİNK","DİPL","DİRİ","DİSK","DİŞİ","DİVA","DİYE","DİZE","DİZİ","DOBO","DOĞA","DOĞU","DOKU","DOLU","DOMA","DONA","DONE","DOST","DOYA","DOZA","DÖLÜ","DÖNÜ","DÖRE","DÖRT","DÖŞÜ","DÖVE","DRAM","DROG","DUAR","DUBA","DUDA","DUDU","DUMA","DURA","DURİ","DURU","DUŞA","DUVA","DUYU","DÜET","DÜĞÜ","DÜKE","DÜNY","DÜŞÜ","DÜTÜ","DÜVE","DÜZE","EBCİ","EBRU","EBUS","EBYA","ECEL","ECİR","ECZA","EDAT","EDEP","EDER","EDİK","EDİM","EDİP","EFOR","EĞER","EĞİK","EĞİM","EĞİN","EĞİR","EĞİŞ","EĞME","EĞRİ","EHİL","EKER","EKİM","EKİN","EKİP","EKLİ","EKME","EKOL","EKRU","EKSE","EKSİ","EKŞİ","EKTİ","ELAN","ELÇİ","ELDE","ELEK","ELEM","ELİF","ELİK","ELİM","ELİT","ELLİ","ELMA","ELTİ","EMAN","EMEK","EMEL","EMEN","EMGİ","EMİK","EMİN","EMİR","EMİŞ","EMLİ","EMME","EMRİ","ENAM","ENEZ","ENİK","ENİR","ENLİ","ENSE","ENVA","EPEY","EPİK","ERAT","ERCE","ERCE","EREK","EREN","ERİK","ERİM","ERİN","ERİŞ","ERKE","ERME","EROZ","ERTE","ESAS","ESEF","ESEN","ESER","ESİK","ESİM","ESİN","ESİR","ESKİ","ESMA","ESME","ESNA","ESRE","EŞEK","EŞEY","EŞİK","EŞİT","EŞLİ","EŞME","EŞYA","ETAP","ETÇİ","ETEK","ETEN","ETER","ETİK","ETİL","ETKİ","ETLİ","ETME","ETOL","ETÖZ","ETÜT","ETÜV","EVCE","EVCİ","EVET","EVİÇ","EVİN","EVLA","EVLİ","EVRE","EYER","EYLE","EYVA","EZAN","EZGİ","EZİK","EZİM","EZİŞ","EZME"
];

// 5-6-7-8-9 Harfli Zengin Popüler Kelime Havuzu
const WORDS_LONG = [
  // 5 Harfli
  "ABACI","ABAZA","ABİDE","ACELE","ACEMİ","ACILI","ACIMA","AÇGÖZ","AÇICI","AÇLIK","AÇMAK","ADALE","ADALI","ADAMA","ADRES","AFACAN","AFAKİ","AFETİ","AFLAT","AFORİ","AFŞİN","AĞACI","AĞILI","AĞLAK","AĞMAK","AĞRAZ","AĞYAR","AHALİ","AHENK","AHFAT","AHİZE","AHLAK","AHMAK","AHRAZ","AHŞAP","AHVAL","AİDAT","AJANS","AKÇIL","AKDUT","AKICI","AKİDE","AKKOR","AKKUŞ","AKLAN","AKLIK","AKMAK","AKMAN","AKMAZ","AKONT","AKORT","AKPAS","AKRAN","AKREP","AKSAK","AKSAM","AKSAN","AKŞAM","AKTAŞ","AKTÖR","ALACA","ALAKA","ALARM","ALBÜM","ALENİ","ALGIN","ALICI","ALİZE","ALKAN","ALKIM","ALKIŞ","ALKOL","ALLIK","ALMAÇ","ALMAK","ALMAN","ALMAZ","ALNAÇ","ALTES","ALTIK","ALTIN","ALTIZ","ALTLY","ALYAN","AMADE","AMBAR","AMBER","AMELE","AMELİ","AMİGO","AMORF","AMPUL","ANANE","ANCAK","ANDIÇ","ANDIK","ANDIZ","ANEKİ","ANEMİ","ANGIÇ","ANGUT","ANİME","ANJİN","ANKET","ANLAK","ANLAM","ANLIK","ANMAK","ANONS","ANTET","ANTİK","ANTLI","ANTRE","ANYON","APLİK","APORT","APOŞİ","APOTR","APRİL","APRON","ARABA","ARABİ","ARACI","ARAMA","ARAMİ","ARAZİ","ARDAK","ARDIÇ","ARDIL","ARENA","ARGAÇ","ARGIN","ARGON","ARICI","ARİFE","ARİYA","ARİZA","ARIZA","ARKIT","ARKOZ","ARMUT","AROMA","ARPÇI","ARPEJ","ARSIZ","ARSİN","ARŞIN","ARŞİV","ARTÇI","ARTIK","ARTIM","ARTIŞ","ARTMA","ASABİ","ASHAP","ASİST","ASKAT","ASKER","ASKLI","ASLAN","ASLEN","ASLIK","ASMAK","ASTAR","ASTAT","ASTIM","ASUDE","AŞAĞI","AŞAMA","AŞEVİ","AŞICI","AŞILI","AŞIRI","AŞİNA","AŞKIK","AŞKIN","AŞLIK","AŞMAK","ATAŞE","ATFEN","ATICI","ATILI","ATLAS","ATLET","ATMAK","ATMIŞ","AVANE","AVANS","AVARA","AVARE","AVAZA","AVENÜ","AVİZE","AVLAK","AVRAT","AVRET","AVŞAR","AVUNÇ","AVURT","AYDIN","AYGIR","AYGIT","AYICI","AYLAK","AYLIK","AYMAK","AYMAZ","AYNAZ","AYNEN","AYRAN","AYRAÇ","AYREK","AYRIK","AYRIM","AYRIT","AYSAR","AYVAZ","AYYAR","AZAMİ","AZILI","AZİZE","AZLIK","AZMAK","AZMAN","AZNİF","AZOTİ","AZVAY",
  "BABAT","BACAK","BAÇÇI","BADAL","BADAS","BADEİ","BADEM","BADİK","BADYA","BAFRA","BAGAJ","BAĞAN","BAĞCI","BAĞDA","BAĞIL","BAĞIM","BAĞIN","BAĞIR","BAĞIŞ","BAĞIT","BAĞLI","BAHAİ","BAHAR","BAHÇE","BAHİS","BAHRİ","BAHŞİ","BAKAM","BAKAN","BAKIM","BAKIR","BAKIŞ","BAKİR","BAKLA","BAKMA","BALAR","BALAT","BALCI","BALET","BALIK","BALKI","BALLI","BALON","BALOZ","BALTA","BALYA","BAMBU","BAMYA","BANAK","BANAL","BANAZ","BANDO","BANGA","BANGI","BANMA","BANYO","BARAJ","BARAK","BARAN","BARBA","BARCI","BARÇA","BARDA","BARDO","BAREM","BARET","BARIŞ","BARİT","BARİZ","BARKA","BAROK","BARON","BARUT","BASAK","BASAR","BASEN","BASIK","BASIM","BASIN","BASIŞ","BASİL","BASİT","BASKI","BASMA","BASSO","BASTI","BAŞAK","BAŞAT","BAŞÇI","BAŞKA","BAŞLI","BAŞTA","BATAK","BATAR","BATIK","BATIL","BATIN","BATIŞ","BATİK","BATKI","BATMA","BATON","BATUR","BAVUL","BAYAN","BAYAT","BAYIR","BAYMA","BAZAL","BAZEN","BAZİK","BAZİT","BEBEK","BEDEL","BEDEN","BEDİİ","BEDİK","BEDİR","BEDÜK","BEGÜM","BEHER","BEHEY","BEHİŞ","BEKAS","BEKÇİ","BEKRİ","BELCE","BELDE","BELEK","BELEN","BELGİ","BELİK","BELİT","BELKİ","BELLİ","BEMOL","BENCE","BENCİ","BENDE","BENEK","BENGİ","BENİZ","BENLİ","BERAT","BERRİ","BESİN","BESNİ","BESTE","BEŞER","BEŞİK","BEŞİZ","BEŞLİ","BEŞME","BEŞON","BEŞUŞ","BETER","BETİK","BETİM","BEYAN","BEYAZ","BEYİN","BEYİT","BEYZİ","BEZCİ","BEZEK","BEZEN","BEZGİ","BEZİK","BEZİR","BEZİŞ","BEZME","BEZSİ","BICIL","BIÇAK","BIÇIK","BIÇKI","BIDIK","BIKMA","BIKIK","BIKIŞ","BILAR","BILDIR","BIYIK","BİATİ","BİBER","BİBLO","BİCİK","BİÇEM","BİÇİM","BİÇİŞ","BİÇKİ","BİÇME","BİDAR","BİDAT","BİDON","BİLEK","BİLET","BİLGE","BİLGİ","BİLİM","BİLİR","BİLİŞ","BİLME","BİLYE","BİNDİ","BİNEK","BİNER","BİNGİ","BİNİŞ","BİNLİ","BİNME","BİRAZ","BİRCİ","BİRER","BİREY","BİRİM","BİRLİ","BİRUN","BİTAP","BİTEK","BİTEY","BİTİK","BİTİM","BİTİŞ","BİTKİ","BİTLİ","BİTME","BİTÜM","BİYEL","BİZAR","BİZCE","BİZON","BLOKE","BOBİN","BOCCE","BOĞAK","BOĞAZ","BOĞMA","BOĞUK","BOĞUM","BOHÇA","BOMBA","BORAK","BORAN","BORAT","BORDA","BORDO","BORİK","BORSA","BORUK","BOYAR","BOYCA","BOYLU","BOYNA","BOYOZ","BOYUN","BOYUT","BOZCA","BOZMA","BOZUK","BOZUM","BOZUR","BOZUŞ","BÖBÜR","BÖCEK","BÖĞÜR","BÖLEN","BÖLGE","BÖLME","BÖLÜK","BÖLÜM","BÖLÜŞ","BÖLÜT","BÖREK","BÖYLE","BRANŞ","BRAVO","BRONZ","BRÖVE","BUCAK","BUÇUK","BUDAK","BUDUN","BUGÜN","BUĞRA","BUĞUR","BUĞUZ","BUHAR","BUHUR","BUJİT","BUKAL","BUKLE","BULAK","BULGU","BULMA","BULUŞ","BULUT","BUNAK","BUNCA","BUNLU","BUNMA","BURAK","BURCU","BURGU","BURMA","BURSA","BURUK","BURUN","BUŞON","BUTİK","BUTLU","BUTON","BUYMA","BUYOT","BUYUR","BUZLA","BUZLU","BUZUL","BÜCÜR","BÜĞLÜ","BÜĞRÜ","BÜKME","BÜKÜÇ","BÜKÜK","BÜKÜM","BÜKÜN","BÜKÜŞ","BÜLÜŞ","BÜNYE","BÜRGÜ","BÜROK","BÜRÜK","BÜRÜN","BÜSİN","BÜTAN","BÜTEN","BÜTEY","BÜTÜN","BÜVET","BÜYÜK","BÜZGE","BÜZGÜ","BÜZME","BÜZÜK",
  // 6 Harfli
  "ABLACI","ABLUKA","ABONMAN","ACEMCE","ACIKLI","ACIKMA","ACILIK","ACIMAK","ACIMAS","ACISIZ","ACİLEN","AÇACAK","AÇELYA","AÇIKÇA","AÇIKGÖZ","AÇILIM","AÇILIŞ","AÇILMA","AÇINIM","AÇINMA","AÇKICI","AÇKILI","ADACIK","ADALET","ADAMCA","ADANMA","ADAPTE","ADAYLIK","ADILCA","ADIMCI","ADLİYE","AFACAN","AFAKİT","AFERİN","AFİYET","AFİŞÇİ","AĞAÇLI","AĞAÇSI","AĞARMA","AĞAŞIK","AĞBACI","AĞDIRI","AĞILIK","AĞIMLI","AĞINTI","AĞIRCA","AĞIRLI","AĞITÇI","AĞIZLI","AĞLAMA","AĞLATI","AĞNAMA","AĞRILI","AĞRIMA","AHACIK","AHENKLİ","AHIRLI","AHIRTI","AHİRET","AHLAKİ","AHLAMA","AHLATİ","AHŞAPÇI","AİLEVİ","AJANDA","AKADEMİ","AKBABA","AKÇELİ","AKDARI","AKDEDE","AKIBET","AKILCA","AKILLI","AKIMCI","AKINCI","AKINTI","AKIŞIK","AKIŞLI","AKITMA","AKLAMA","AKLİYE","AKONTİ","AKORDİ","AKORTÇU","AKRABA","AKREBİ","AKRİLİ","AKSAĞI","AKSAKİ","AKSEKİ","AKSONA","AKSUNA","AKŞAMA","AKŞINİ","AKTARİ","AKTİVE","AKTÖRE","AKTÜEL","AKVARY","ALABAL","ALABAT","ALACAK","ALAÇIK","ALAİMİ","ALAMAT","ALAMUT","ALATAV","ALATUR","ALAYCI","ALAYLI","ALBÜMİ","ALÇACI","ALÇAMA","ALÇICI","ALÇILI","ALDEHİ","ALERJİ","ALETLİ","ALEVSİ","ALEYHİ","ALFABA","ALGARİ","ALGLER","ALICIK","ALIKÇA","ALIMCI","ALIMLI","ALINMA","ALINTI","ALIŞIK","ALIŞKI","ALIŞMA","ALİDAT","ALİFAT","ALİYEN","ALKARİ","ALKIŞÇI","ALMAÇÇI","ALMANA","ALPAKA","ALPAYİ","ALPERİ","ALŞİMİ","ALŞİST","ALTILI","ALTINC","ALTINÇ","ALTMIŞ","ALTYAP","AMALIK","AMAZON","AMBALE","AMBARC","AMBERİ","AMİLAZ","AMİRAL","AMİTOZ","AMNEZİ","AMORTİ","AMUVAL","ANACIL","ANADOL","ANAERB","ANAFAZ","ANAFOR","ANALİZ","ANALİT","ANALIK","ANALOG","ANANAS","ANARŞİ","ANASON","ANASOY","ANASUR","ANBEAN","ANCASI","ANDANT","ANEMİK","ANEROİ","ANGAJE","ANGORA","ANGUDİ","ANIKLI","ANILMA","ANINDA","ANIRIŞ","ANIRMA","ANISAL","ANITLI","ANITSI","ANIZLI","ANİLİN","ANİMAT","ANİMEK","ANİMON","ANKARA","ANLAMA","ANLAMI","ANLATI","ANLATI","ANONİM","ANORAK","ANTENİ","ANTETİ","ANTİLO","ANTRAK","ANTROP","APALAK","APARAT","APARKİ","APATİT","APAYRI","APERİT","APIŞIK","APIŞMA","APLİKE","APOLET","APORİA","APOSTO","APOTEM","APRAKS","ARABAN","ARABUL","ARACIL","ARAKÇI","ARAKLI","ARALIK","ARAMAK","ARANJE","ARANMA","ARANTI","ARAPÇA","ARASAT","ARASIZ","ARASTA","ARAYIŞ","ARAZÖZ","ARBEDE","ARDIŞIK","ARDİYE","ARGAÇI","ARGINI","ARGOCA","ARICIL","ARINIK","ARINMA","ARINTI","ARITIM","ARITIŞ","ARITMA","ARİYET","ARİSTO","ARİTMİ","ARKAİK","ARKALI","ARKTIK","ARMADA","ARMALI","ARMUDİ","ARMONİ","ARNİKA","AROMAT","ARPAÇI","ARPACI","ARPALIK","ARPACI","ARŞINL","ARTAMA","ARTICI","ARTINÇ","ARTMAK","ARTMIŞ","ARTROZ","ARTVİN","ASALET","ASARCI","ASBEST","ASEPSİ","ASETAT","ASETİK","ASETİL","ASFALT","ASGARİ","ASILIK","ASILIŞ","ASILMA","ASILTI","ASINTI","ASIRLI","ASİLİK","ASİMAN","ASİMET","ASİNAT","ASİNTİ","ASİTLİ","ASKICI","ASKILI","ASLANI","ASMAKİ","ASORTİ","ASRİCE","AŞARCI","AŞERME","AŞIKLI","AŞILIK","AŞILIŞ","AŞILMA","AŞINIM","AŞINMA","AŞINTI","AŞIRMA","AŞIRTI","AŞISIZ","AŞİKÂR","AŞİRET","AŞİYAN","AŞKALE","AŞKALE","AŞKÇIL","AŞKSIZ","ATABEY","ATACIK","ATALET","ATALIK","ATAMAN","ATANMA","ATANMI","ATANTI","ATARİK","ATARİT","ATAŞEL","ATEİST","ATEİZM","ATEŞÇİ","ATEŞİN","ATEŞLİ","ATIFLI","ATIKÇI","ATILIK","ATILIM","ATILIŞ","ATILMA","ATIMCI","ATIŞMA","ATKILI","ATLAMA","ATLATİ","ATLETI","ATSINE","AVALCA","AVANAK","AVANTA","AVAREL","AVARYA","AVDETİ","AVİSTA","AVİZEL","AVLAMA","AVOKAD","AVRUPA","AVUNMA","AVUNTU","AVURTL","AYAKÇI","AYAKLI","AYAKSI","AYAKTA","AYARCI","AYARLI","AYAZMA","AYBASTI","AYBEAY","AYDEMİ","AYDINL","AYGIRI","AYIKMA","AYILIK","AYILMA","AYILTI","AYINGA","AYIPLI","AYIRMA","AYIRTI","AYKIRI","AYLAMA","AYNACI","AYNISI","AYNİYAT","AYRICA","AYRILI","AYRIMA","AYRIŞI","AYRIŞM","AYRITI","AYSFİT","AYVAZİ","AZACIK","AZALMA","AZAMET","AZAPLI","AZATLI","AZERİCE","AZGELİ","AZGINI","AZIKLI","AZIŞMA","AZİMET","AZİMLİ","AZİMUT","AZİZEM","AZMANI","AZOTLU",
  // 7-8-9 Harfli Çarpıcı Popüler Kelimeler (Bir Kelime Etabı Yıldızları)
  "ARKADAŞ","BAŞKENT","ÇİKOLATA","DELİKANLI","EĞLENCE","FIRTINA","GÖKKUŞAĞI","HASTANE","İSTANBUL","JANDARMA","KAHVALTI","LOKANTA","MERDİVEN","NERGİSGÜL","OYUNCAK","PATLICAN","RÖPORTAJ","SİVİLCE","ŞAMPİYON","TEKNOLOJİ","UÇURTMA","ÜNİVERSİTE","VOLKANİK","YILDIRIM","ZEYTİNYAĞI",
  "AKDENİZ","BAHARAT","CANAVAR","DONDURMA","EJDERHA","FOTOĞRAF","GÜVERCİN","HEMŞİRE","IHLAMUR","İSKEMLE","KAPLUMBAĞA","LABORATUVAR","MANDALİNA","NİKAHŞEKERİ","OTOBÜSÇÜ","PENCERE","RADYATÖR","SANDALYE","ŞEMSİYE","TİMSAHÇIK","UÇAKSAVAR","ÜRETİCİ","VİCDANLI","YUMURTACI","ZÜMRÜTİ",
  "ALFABETİK","BİLGİSAYAR","COĞRAFYA","DİNAZOR","ELEKTRİK","FELSEFİ","GÖKYÜZÜ","HAYVANAT","ISPANAK","İNCELİKLİ","JÖLELİ","KASAPLIK","LİMONATA","MÜHENDİS","NEZAKET","OKYANUS","PIRLANTA","REZERVASYON","SİNEMACI","ŞÖVALYE","TELEFON","UZAYGEMİSİ","ÜÇGENSEL","VEZİRPARNAĞI","YOLCULUK","ZAMANLAMA",
  "BALIKÇI","ÇERÇEVE","DENİZCİ","FIRTINALI","GÜNEŞLİK","HAZİNECİ","İLETİŞİM","KAZANCI","MANDIRA","ORMANCI","PİYANGO","RÜZGARLI","SELVİLİK","ŞARKICI","TOPLANTI","UZMANLIK","YAZARLIK","ZEKİCE",
  "ÇAYDANLIK","DEDEKTİF","FASULYE","GÖZLÜKÇÜ","HİKAYECİ","ISLIKÇI","KARTPOSTAL","LOKOMOTİF","MERMERLİ","PAPAĞAN","REÇELLİK","SULTANLIK","ŞEHİRLİK","TERLİKLİ","YARATICI",
  "BAŞARILI","DİKKATLİ","FIRSATÇI","GÜVENLİK","HAYATİYE","İNTİKAM","KAHRAMAN","LEZZETLİ","MUTLULUK","NEŞELİK","ÖZGÜRLÜK","PENCERELİ","SAYGISIZ","ŞAŞIRTICI","TEHLİKELİ","YETENEKLİ","ZENGİNLİK"
];

// Deste kelimelerini de tara ve tekil Türkçe kelimeleri ekle
let deckWords = [];
try {
  const decksContent = fs.readFileSync(path.join(__dirname, '..', 'js', 'decks.js'), 'utf8');
  const matches = decksContent.match(/"([^"]+)"/g) || [];
  matches.forEach(m => {
    const raw = m.replace(/"/g, '').trim();
    raw.split(/[\s\-\/\(\)\,\.\'\:\;\!\?]+/).forEach(tok => {
      const clean = tok.toLocaleUpperCase('tr-TR').trim();
      if (/^[ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ]{3,9}$/.test(clean)) {
        deckWords.push(clean);
      }
    });
  });
} catch (e) {
  console.warn('decks.js okunamadı:', e.message);
}

// Tüm listeleri birleştir ve tekilleştir
const allWordsSet = new Set();
[...BASE_TURKISH_WORDS, ...WORDS_4, ...WORDS_LONG, ...deckWords].forEach(w => {
  const clean = w.toLocaleUpperCase('tr-TR').trim();
  if (/^[ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ]{3,9}$/.test(clean)) {
    allWordsSet.add(clean);
  }
});

const sortedWords = Array.from(allWordsSet).sort((a, b) => a.length - b.length || a.localeCompare(b, 'tr'));

console.log(`Toplam ${sortedWords.length} adet geçerli 3-9 harfli Türkçe kelime hazırlandı.`);

const outContent = `// js/kelime-data.js
// Kafana Tak! - Bir Kelime Bir İşlem: 3-9 Harfli Sözlük ve Sayı Çözücü Motoru

export const TURKISH_VOWELS = ['A', 'E', 'I', 'İ', 'O', 'Ö', 'U', 'Ü'];
export const TURKISH_CONSONANTS = [
  'B', 'C', 'Ç', 'D', 'F', 'G', 'Ğ', 'H', 'J', 'K', 'L', 'M',
  'N', 'P', 'R', 'S', 'Ş', 'T', 'V', 'Y', 'Z'
];

// Türkçe kelime oluşturmaya en elverişli frekans ağırlıklı torbalar
export const WEIGHTED_VOWELS = [
  'A', 'A', 'A', 'A', 'E', 'E', 'E', 'E', 'İ', 'İ', 'İ',
  'I', 'I', 'O', 'O', 'U', 'U', 'Ö', 'Ü'
];

export const WEIGHTED_CONSONANTS = [
  'K', 'K', 'K', 'L', 'L', 'L', 'M', 'M', 'M', 'N', 'N', 'N',
  'R', 'R', 'R', 'S', 'S', 'T', 'T', 'T', 'Y', 'Y', 'B', 'B',
  'D', 'D', 'C', 'Ç', 'G', 'Ğ', 'H', 'P', 'Ş', 'V', 'Z', 'F', 'J'
];

export const LARGE_NUMBERS = [10, 25, 50, 75, 100];
export const SMALL_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// 3-9 Harfli Zengin Türkçe Sözlük Kümesi
export const KELIME_DICTIONARY = new Set(${JSON.stringify(sortedWords)});

/**
 * Verilen harf dizilimi ve 1 adet Joker ile yazılabilecek en uzun ve en iyi kelimeleri bulur.
 * @param {string[]} letters - 8-9 adet harf (ör: ['A', 'K', 'L', '★'])
 * @returns {Array<{ word: string, length: number, points: number }>}
 */
export function findBestWordsFromLetters(letters, maxResults = 10) {
  const normLetters = letters.map(l => l.toLocaleUpperCase('tr-TR'));
  const hasJoker = normLetters.includes('★') || normLetters.includes('*') || normLetters.includes('JOKER');
  const fixedLetters = normLetters.filter(l => l !== '★' && l !== '*' && l !== 'JOKER');

  const letterCount = {};
  for (const ch of fixedLetters) {
    letterCount[ch] = (letterCount[ch] || 0) + 1;
  }

  const matches = [];

  for (const word of KELIME_DICTIONARY) {
    if (word.length > letters.length) continue;
    if (word.length < 3) continue;

    const wCount = {};
    for (const ch of word) {
      wCount[ch] = (wCount[ch] || 0) + 1;
    }

    let missing = 0;
    let possible = true;
    for (const ch in wCount) {
      const avail = letterCount[ch] || 0;
      if (wCount[ch] > avail) {
        missing += (wCount[ch] - avail);
        if (missing > (hasJoker ? 1 : 0)) {
          possible = false;
          break;
        }
      }
    }

    if (possible && missing <= (hasJoker ? 1 : 0)) {
      const points = word.length * 10 + (word.length === 8 ? 20 : 0) + (word.length === 9 ? 50 : 0);
      matches.push({ word, length: word.length, points });
    }
  }

  // Uzunluğa ve puana göre azalan sırada sırala
  matches.sort((a, b) => b.length - a.length || b.points - a.points || a.word.localeCompare(b.word, 'tr'));
  return matches.slice(0, maxResults);
}

/**
 * Bir İşlem Geri-İzleme (Backtracking) Sayı Çözücüsü
 * 6 sayı ve hedef ile tam isabet veya en yakın çözümü milisaniyeler içinde adımlarıyla bulur.
 */
export function solveCountdownNumbers(numbers, target) {
  let bestDiff = Math.abs(numbers[0] - target);
  let bestVal = numbers[0];
  let bestSteps = [];

  function search(nums, steps) {
    for (let i = 0; i < nums.length; i++) {
      const diff = Math.abs(nums[i] - target);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestVal = nums[i];
        bestSteps = [...steps];
        if (diff === 0) return true;
      }
    }
    if (nums.length <= 1) return false;

    for (let i = 0; i < nums.length; i++) {
      for (let j = 0; j < nums.length; j++) {
        if (i === j) continue;
        const a = nums[i];
        const b = nums[j];
        const remaining = nums.filter((_, idx) => idx !== i && idx !== j);

        // Toplama
        if (a <= b) {
          const res = a + b;
          if (search([res, ...remaining], [...steps, \`\${a} + \${b} = \${res}\`])) return true;
        }
        // Çarpma
        if (a <= b && a > 1 && b > 1) {
          const res = a * b;
          if (search([res, ...remaining], [...steps, \`\${a} × \${b} = \${res}\`])) return true;
        }
        // Çıkarma
        if (a > b) {
          const res = a - b;
          if (search([res, ...remaining], [...steps, \`\${a} - \${b} = \${res}\`])) return true;
        }
        // Bölme
        if (b > 1 && a % b === 0) {
          const res = a / b;
          if (search([res, ...remaining], [...steps, \`\${a} ÷ \${b} = \${res}\`])) return true;
        }
      }
    }
    return false;
  }

  search(numbers, []);
  return { bestVal, bestDiff, bestSteps, isExact: bestDiff === 0 };
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'js', 'kelime-data.js'), outContent, 'utf8');
console.log('js/kelime-data.js başarıyla oluşturuldu!');
