# Worksheet Arbitrase — 56 item non-unanimous (panel konsensus v1.1)

**Siapa yang mengisi: PENELITI** (lapisan manusia pertama — jangan diisi oleh AI/agen).
**Cara mengisi:** edit `gold-verdicts-arbitration.csv` — kolom `must_ok`, `optional_ok`,
`query_ok` diisi `1`/`0`, `notes` opsional (alasan singkat). Worksheet ini hanya konteks
bacaan; CSV adalah target final.

## Aturan keputusan (rubric panel, sama dengan reviewer LLM)

- `must_ok` = apakah gold *must-structure* benar-benar target utama dari query?
- `optional_ok` = apakah set *optional* wajar (co-mention dari passage yang sama)?
- `query_ok` = apakah query unambiguous dan answerable dari korpus?
- Anda bebas **menyetujui mayoritas atau membaliknya** — tidak ada kewajiban mengikuti panel.
- Konteks packet memakai jawaban B3 gpt-4o-mini (`final-mini-r3`) sebagai ilustrasi; nilai
  GOLD-nya, bukan kualitas jawaban itu.
- Flag `weak_gold_chunk`/`no_gold_chunk` memengaruhi `query_ok` (answerability), bukan `must_ok`.

## Muatan

56 item; perbedaan antar-rater terkonsentrasi di `optional_ok`/`query_ok`
(hanya 6 item yang beda pada `must_ok`). Vote per rater ditampilkan di tiap item.

## Item

### 1. `F-regions-008`  (F · regions)
**Query:** What is the function of the Temporal region?
**Gold must:** `temporalregion`
**Gold optional:** 8 struktur — cavernoussinus, internalcarotidartery, lateralrectusmuscle, mandible, oralregion, parotidgland, pons, temporalbone
**Gold chunk (potongan):** The mandibular nerve [V3] also receives sensory branches from the skin of the lower face, cheek, lower lip, anterior part of the external ear, part of the external acoustic meatus and the temporal region, the anterior two-thirds of the tongue, the teeth of the lower jaw, the mastoid air cells, the mucous membranes of the cheek, the mandible, and dura in the middle cranial fossa. The abducent nerve

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | weak_gold_chunk; Query target (temporal region) is correct and required optional extras are plausible structures from the same head/neck passage (V3/abducent nerve context: mandibl |
| deepseek | 1 | 1 | 0 | weak_gold_chunk; Gold must 'temporalregion' matches the asked entity, and optional extras are plausibly related to the same head/neural passage however the query asks for the 'func |
| qwen | 1 | 1 | 1 | weak_gold_chunk; Temporal region is the required target, but the chunk only mentions V3 sensory innervation and does not state its function optional structures are plausibly relate |
| **konsensus ≥2/3** | 1 | 1 | 1 | weak_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 2. `F-regions-015`  (F · regions)
**Query:** Where is the Deltopectoral triangle located?
**Gold must:** `deltopectoraltriangle`
**Gold optional:** 3 struktur — basilicvein, cephalicvein, clavicle
**Gold chunk (potongan):** The cephalic and basilic veins originate from the dorsal venous network on the back of the hand. The cephalic vein originates over the anatomical snuffbox at the base of the thumb, passes laterally around the distal forearm to reach the anterolateral surface of the limb, and then continues proximally. It crosses the elbow, then passes up the arm into a triangular depression—the clavipectoral trian

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | weak_gold_chunk; Query is a clear factual location question and the deltopectoral triangle is the correct required target optional extras (cephalic vein, clavicle, basilic vein) ar |
| deepseek | 1 | 0 | 1 | weak_gold_chunk; Gold must (deltopectoral triangle) is the correct target for the location query. However, the gold chunk is about cephalic/basilic veins and only mentions the clav |
| qwen | 1 | 1 | 1 | weak_gold_chunk; Query is clear, but the chunk mainly describes superficial veins and only mentions a clavipectoral triangle without giving its location optional structures are pas |
| **konsensus ≥2/3** | 1 | 1 | 1 | weak_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 3. `F-regions-022`  (F · regions)
**Query:** Where is the Palm located?
**Gold must:** `palm`
**Gold optional:** 8 struktur — basilicvein, cephalicvein, commonpalmardigitalarteries, deeppalmararch, dorsalmetacarpalarteries, extensorpollicislongus, palmaraponeurosis, palmarmetacarpalarteries
**Gold chunk (potongan):** The palmar digital nerves cross the palm deep to the palmar aponeurosis and the superficial palmar arch and enter the digits. They innervate skin on the palmar surfaces of the lateral three and one-half digits and cutaneous regions over the dorsal aspects of the distal phalanges (nail beds) of the same digits. In addition to skin, the digital nerves supply the lateral two lumbrical muscles. Superf

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | weak_gold_chunk; Query is clear and 'palm' is the correct required target optional extras are all plausible upper-limb/hand structures. However, the gold chunk describes the course |
| deepseek | 1 | 1 | 1 | weak_gold_chunk; Gold must 'palm' matches the queried structure optional hand/palm structures are related. Query is answerable, but the gold chunk only incidentally mentions the pa |
| qwen | 1 | 0 | 1 | weak_gold_chunk; Query asks palm location chunk only mentions palm in relation to digital nerves, not where it is located. Gold must palm is the queried subject, but optional inclu |
| **konsensus ≥2/3** | 1 | 1 | 1 | weak_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 4. `F-fasciae-007`  (F · fasciae)
**Query:** What is the Superior fibular retinaculum?
**Gold must:** `superiorfibularretinaculum`
**Gold optional:** 8 struktur — calcaneus, deeptransversemetatarsalligament, fibula, fibularisbrevismuscle, flexordigitorumlongus, inferiorfibularretinaculum, lateralmalleolus, plantaraponeurosis
**Gold chunk (potongan):** Fibular (peroneal) retinacula bind the tendons of the fibularis longus and fibularis brevis muscles to the lateral side of the foot (Fig. 6.112): A superior fibular retinaculum extends between the lateral malleolus and the calcaneus. An inferior fibular retinaculum attaches to the lateral surface of the calcaneus around the fibular trochlea and blends above with the fibers of the inferior extensor

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | F-type definition query directly targets the superior fibular retinaculum, which is the sole must-have gold chunk is the exact passage defining it optional extras are all plausible |
| deepseek | 1 | 0 | 1 | Gold must correctly requires the queried structure. Optional list includes unrelated foot structures (deep transverse metatarsal ligament, flexor digitorum longus, plantar aponeuro |
| qwen | 1 | 0 | 1 | Optional includes unrelated structures such as deep transverse metatarsal ligament, flexor digitorum longus, and plantar aponeurosis. |
| **konsensus ≥2/3** | 1 | 0 | 1 | non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 5. `F-muscular-013`  (F · muscular)
**Query:** What is the Superior gemellus muscle?
**Gold must:** `superiorgemellusmuscle`
**Gold optional:** 4 struktur — glutealregion, obturatorinternus, piriformismuscle, pudendalnerve
**Gold chunk (potongan):** The inferior gluteal nerve, formed by branches from the dorsal divisions of L5 to S2, leaves the pelvic cavity through the greater sciatic foramen inferior to the piriformis muscle and supplies the gluteus maximus, the largest muscle in the gluteal region. Both superior and inferior gluteal nerves are accompanied by corresponding arteries. The nerve to the obturator internus and the associated sup

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | weak_gold_chunk; Query is a clear factual question and 'superiorgemellusmuscle' is the correct required target optional extras are plausible gluteal-region co-topics. However, the  |
| deepseek | 1 | 1 | 1 | weak_gold_chunk; Gold chunk discusses inferior/superior gluteal nerves and obturator internus nerve, not the superior gemellus muscle it only weakly relates to the query. |
| qwen | 1 | 0 | 1 | weak_gold_chunk; Gold must is correct and query is factual, but optional includes pudendal nerve as unrelated chunk is mainly about gluteal nerves and weakly relates to superior ge |
| **konsensus ≥2/3** | 1 | 1 | 1 | weak_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 6. `F-muscular-020`  (F · muscular)
**Query:** What is the Mylohyoid muscle?
**Gold must:** `mylohyoidmuscle`
**Gold optional:** 7 struktur — genioglossusmuscle, geniohyoidmuscle, hyoidbone, inferioralveolarnerve, mandible, softpalate, tongue
**Gold chunk (potongan):** Like the muscles of mastication, the mylohyoid muscles are innervated by the mandibular nerve [V3]. The specific branch that innervates the mylohyoid muscles is the nerve to the mylohyoid from the inferior alveolar nerve. The geniohyoid muscles (Table 8.20) are paired cord-like muscles that run, one on either side of the midline, from the inferior mental spines on the posterior surface of the mand

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | Simple factual query about the mylohyoid muscle gold must correctly targets it, optional extras are all plausible floor-of-mouth/suprahyoid neighbors, and the chunk directly discus |
| deepseek | 1 | 1 | 1 | Mylohyoid muscle is the correct required target for a factual definition query optional structures are plausibly related head/neck anatomy. Gold chunk is relevant though focused on |
| qwen | 1 | 0 | 1 | Mylohyoid is the required target. Optional list includes soft palate, which is not plausibly related to the query or the gold chunk about mylohyoid innervation and nearby geniohyoi |
| **konsensus ≥2/3** | 1 | 1 | 1 | non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 7. `F-joints-009`  (F · joints)
**Query:** Where is the Transverse humeral ligament located?
**Gold must:** `transversehumeralligament`
**Gold optional:** 8 struktur — anteriorcircumflexhumeralartery, axillaryartery, axillaryvein, brachialartery, clavicle, coracoacromialligament, coracohumeralligament, glenoidlabrum
**Gold chunk (potongan):** Fig. 7.23 Sternoclavicular joint. A. Bones and ligaments. B. Volume-rendered reconstruction using multidetector computed tomography. CostoclavicularligamentInterclavicularligamentClavicular notchAnteriorsternoclavicularligamentManubrium ofsternumSternal angleArticular disc(capsule and ligamentsremoved anteriorlyto expose joint)Attachment sitefor rib IIFirst costalcartilageRib IVertebral body of TI

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | weak_gold_chunk; Query is a clear factual location question gold must (transverse humeral ligament) is correct and optional extras are plausible shoulder-region structures. However |
| deepseek | 1 | 0 | 1 | weak_gold_chunk; Gold must correctly names the queried ligament. Optional extras are not plausibly tied to the sternoclavicular-joint chunk and mostly unrelated to the transverse h |
| qwen | 1 | 0 | 1 | weak_gold_chunk; Gold must is the queried ligament and is anatomy-correct. Optional list includes many unrelated shoulder/axillary structures not plausibly tied to the passage or q |
| **konsensus ≥2/3** | 1 | 0 | 1 | weak_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 8. `F-joints-012`  (F · joints)
**Query:** Where is the Lateral meniscus located?
**Gold must:** `lateralmeniscus`
**Gold optional:** 7 struktur — anteriorcruciateligament, femur, medialmeniscus, patella, popliteusmuscle, posteriorcruciateligament, tibia
**Gold chunk (potongan):** There are two menisci, which are fibrocartilaginous C-shaped cartilages, in the knee joint, one medial (medial meniscus) and the other lateral (lateral meniscus) (Fig. 6.73). Both are attached at each end to facets in the intercondylar region of the tibial plateau. The medial meniscus is attached around its margin to the capsule of the joint and to the tibial collateral ligament, whereas the later

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | Factual location query targeting lateral meniscus gold must is correct. Optional extras are all knee-joint structures plausibly related to the menisci passage. Chunk directly descr |
| deepseek | 1 | 1 | 1 |  |
| qwen | 0 | 1 | 1 | Gold must only names the lateral meniscus, but the query requires its location (knee joint/intercondylar tibial plateau) chunk and query are otherwise relevant. |
| **konsensus ≥2/3** | 1 | 1 | 1 | non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 9. `F-joints-020`  (F · joints)
**Query:** Where is the Median thyrohyoid ligament located?
**Gold must:** `medianthyrohyoidligament`
**Gold optional:** 8 struktur — arytenoidcartilage, corniculatecartilage, cricoidcartilage, epiglottis, hyoidbone, lateralthyrohyoidligament, quadrangularmembrane, trachea
**Gold chunk (potongan):** An aperture in the lateral part of the thyrohyoid membrane on each side is for the superior laryngeal artery, the internal branch of the superior laryngeal nerve, and lymphatics. The posterior borders of the thyrohyoid membrane are thickened to form the lateral thyrohyoid ligaments. The membrane is also thickened anteriorly in the midline to form the median thyrohyoid ligament. Occasionally, there

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | Query is a clear factual location question median thyrohyoid ligament is the correct required target optional extras are all plausible laryngeal-region structures gold chunk direct |
| deepseek | 0 | 1 | 1 | Gold must is the queried structure itself, not the location for a 'where' question the required target should be the location (e.g., thyrohyoid membrane, thyroid cartilage, hyoid b |
| qwen | 1 | 1 | 1 | Query is a clear factual location question gold must includes the target structure. Chunk directly states the median thyrohyoid ligament forms from the anterior midline thyrohyoid  |
| **konsensus ≥2/3** | 1 | 1 | 1 | non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 10. `F-skeletal-008`  (F · skeletal)
**Query:** What is the function of the Clavicle?
**Gold must:** `clavicle`
**Gold optional:** 6 struktur — humerus, levatorscapulae, radius, scapula, teresminormuscle, ulna
**Gold chunk (potongan):** The bones of the shoulder consist of the scapula, clavicle, and proximal end of the humerus (Fig. 7.7). The clavicle articulates medially with the manubrium of the sternum and laterally with the acromion of the scapula, which arches over the joint between the glenoid cavity of the scapula and the head of the humerus (the glenohumeral joint). The humerus is the bone of the arm (Fig. 7.7). The dista

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | Query is a clear factual question clavicle is the correct required target. Optional extras (humerus, scapula, radius, ulna, levator scapulae, teres minor) are all upper-limb/should |
| deepseek | 1 | 0 | 1 | weak_gold_chunk; Clavicle is the correct required target and the query is clear. Optional extras include forearm bones and shoulder/neck muscles not directly tied to clavicle funct |
| qwen | 1 | 1 | 1 | Gold must correctly targets clavicle for its function optional extras are plausibly shoulder/upper-limb related chunk describes shoulder bones and clavicle articulations, relevant  |
| **konsensus ≥2/3** | 1 | 1 | 1 | non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 11. `F-skeletal-012`  (F · skeletal)
**Query:** What is the function of the Scapula?
**Gold must:** `scapula`
**Gold optional:** 7 struktur — dorsalscapularnerve, humerus, levatorscapulae, scapularregion, supraspinousligament, teresmajormuscle, teresminormuscle
**Gold chunk (potongan):** The levator scapulae muscle is innervated by the dorsal scapular nerve and directly from C3 and C4 spinal nerves. The levator scapulae elevates the scapula. The rhomboid minor and major muscles attach medially to the vertebral column and descend laterally to attach to the medial border of the scapula inferior to the levator scapulae muscle (Fig. 7.36). The rhomboid minor originates from the lower

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 0 | 1 | Query is a clear factual question and 'scapula' is the correct required target. However, the optional list includes 'supraspinousligament', which is a vertebral-column ligament (sp |
| deepseek | 1 | 1 | 1 | weak_gold_chunk; Query is a clear factual question about scapula function, and scapula is the correct required target. Optional structures are plausibly related to scapular anatomy |
| qwen | 1 | 1 | 1 | weak_gold_chunk; Chunk mainly describes levator scapulae/rhomboid actions and attachments rather than scapula function optional terms are plausible scapula/shoulder-related extras. |
| **konsensus ≥2/3** | 1 | 1 | 1 | weak_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 12. `F-skeletal-019`  (F · skeletal)
**Query:** What is the Medial cuneiform bone?
**Gold must:** `medialcuneiformbone`
**Gold optional:** 4 struktur — calcaneus, fibula, fibularislongusmuscle, navicularbone
**Gold chunk (potongan):** From lateral to medial, the distal group of tarsal bones consists of (Fig. 6.96): The cuboid (Greek for “cube”), which articulates posteriorly with the calcaneus, medially with the lateral cuneiform, and anteriorly with the bases of the lateral two metatarsals—the tendon of the fibularis longus muscle lies in a prominent groove on the anterior plantar surface, which passes obliquely forward across

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | Factual definitional query medial cuneiform is the correct required target. Optional extras (calcaneus, fibula, fibularis longus, navicular) are all plausibly tied to the tarsal-bo |
| deepseek | 1 | 1 | 1 | weak_gold_chunk; Gold must structure is correct. Optional extras are related foot/tarsal structures. Query is clear factual. Gold chunk discusses tarsal bones but does not mention  |
| qwen | 1 | 0 | 1 | weak_gold_chunk; Gold chunk omits medial cuneiform and is weakly related optional includes fibula, not plausibly related to the query/passage. |
| **konsensus ≥2/3** | 1 | 1 | 1 | weak_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 13. `F-cardiovascular-012`  (F · cardiovascular)
**Query:** What is the Superior vena cava?
**Gold must:** `superiorvenacava`
**Gold optional:** 8 struktur — ascendingaorta, azygosvein, cephalicvein, internaljugularvein, leftbrachiocephalicvein, leftcommoncarotidartery, leftmainbronchus, leftpulmonaryartery
**Gold chunk (potongan):** In the clinic Using the superior vena cava to access the inferior vena cava Because the superior and inferior venae cavae are oriented along the same vertical axis, a guidewire, catheter, or line can be passed from the superior vena cava through the right atrium and into the inferior vena cava. This is a common route of access for such procedures as: transjugular liver biopsy, transjugular intrahe

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | weak_gold_chunk; Query is a clear factual 'what is' question and SVC is the correct required target optional extras are plausible related structures (tributaries/neighbors). Howeve |
| deepseek | 1 | 1 | 1 | weak_gold_chunk; SVC is the correct required structure for a factual definition query optional structures are plausible mediastinal/venous neighbors. However, the gold chunk is a c |
| qwen | 1 | 0 | 1 | weak_gold_chunk; SVC is correctly required and query is well-posed, but optional includes left-sided/mediastinal structures not plausibly related to SVC, and the chunk is only a cl |
| **konsensus ≥2/3** | 1 | 1 | 1 | weak_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 14. `F-cardiovascular-019`  (F · cardiovascular)
**Query:** What is the Left gastric artery?
**Gold must:** `leftgastricartery`
**Gold optional:** 8 struktur — abdominalaorta, bileduct, commonhepaticartery, duodenum, gallbladder, gastroduodenalartery, inferiorphrenicartery, jejunum
**Gold chunk (potongan):** The arterial supply to the stomach (Fig. 4.63) includes: the left gastric artery from the celiac trunk, the right gastric artery, often from the hepatic artery proper, the right gastro-omental artery from the gastroduodenal artery, the left gastro-omental artery from the splenic artery, and the posterior gastric artery from the splenic artery (variant and not always present). The small intestine i

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | Simple F query directly targeting left gastric artery gold must correct. Optional extras are plausible co-passage structures (celiac/hepatic branches, upper GI organs). Chunk direc |
| deepseek | 1 | 1 | 1 | Query asks for definition of left gastric artery gold must is correct. Optional structures are plausibly related upper-abdominal/arterial-supply context. Chunk directly supports th |
| qwen | 1 | 0 | 1 | Optional includes several structures unrelated to the left gastric artery query/chunk, such as bile duct, gallbladder, duodenum, jejunum, and inferior phrenic artery. |
| **konsensus ≥2/3** | 1 | 1 | 1 | non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 15. `F-cardiovascular-022`  (F · cardiovascular)
**Query:** What is the function of the Short posterior ciliary arteries?
**Gold must:** `shortposteriorciliaryarteries`
**Gold optional:** 8 struktur — centralretinalartery, lacrimalartery, lacrimalgland, longposteriorciliaryarteries, ophthalmicartery, retina, sclera, supraorbitalartery
**Gold chunk (potongan):** The arterial supply to the eyeball is from several sources: The short posterior ciliary arteries are branches from the ophthalmic artery that pierce the sclera around the optic nerve and enter the choroid layer (Fig. 8.108). The long posterior ciliary arteries, usually two, enter the sclera on the medial and lateral sides of the optic nerve and proceed anteriorly in the choroid layer to anastomose

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | Query is a clear factual question about the short posterior ciliary arteries gold must correctly targets that structure. Chunk directly describes these arteries (origin from ophtha |
| deepseek | 1 | 1 | 1 | All verdicts pass gold must is the asked structure, optional extras are related ocular/ophthalmic artery structures, and the chunk directly supports the factual function query. |
| qwen | 1 | 0 | 1 | Required target is correct, but optional list includes lacrimal gland/artery and supraorbital artery, which are not plausibly related to the function of short posterior ciliary art |
| **konsensus ≥2/3** | 1 | 1 | 1 | non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 16. `F-lymphoid-004`  (F · lymphoid)
**Query:** What is the Brachiocephalic nodes?
**Gold must:** `brachiocephalicnodes`
**Gold optional:** 8 struktur — cephalicvein, diaphragm, intercostalnerves, leftatrium, leftventricle, parasternalnodes, pleura, rightatrium
**Gold chunk (potongan):** Nodes associated with the diaphragm interconnect with parasternal, prevertebral, and juxta-esophageal nodes, brachiocephalic nodes (anterior to the brachiocephalic veins in the superior mediastinum), and lateral aortic/lumbar nodes (in the abdomen). Superficial regions of the thoracic wall drain mainly into axillary lymph nodes in the axilla or parasternal nodes. Innervation of the thoracic wall i

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | Query clearly targets brachiocephalic nodes (minor grammar only) gold must matches the definition in the chunk (nodes anterior to brachiocephalic veins in superior mediastinum) opt |
| deepseek | 1 | 0 | 1 | Gold must correctly targets brachiocephalic nodes. Optional list includes clearly unrelated structures such as cephalicvein, leftatrium, leftventricle, and rightatrium, so optional |
| qwen | 1 | 0 | 1 | Optional list includes unrelated structures (cardiac chambers, pleura, cephalic vein) not plausibly tied to the query or passage. |
| **konsensus ≥2/3** | 1 | 0 | 1 | non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 17. `F-lymphoid-008`  (F · lymphoid)
**Query:** What is the function of the Parasternal nodes?
**Gold must:** `parasternalnodes`
**Gold optional:** 8 struktur — apicalaxillarynodes, azygosvein, brachiocephalicnodes, centralaxillarynodes, cephalicvein, diaphragm, intercostalnerves, intercostalnodes
**Gold chunk (potongan):** Nodes associated with the diaphragm interconnect with parasternal, prevertebral, and juxta-esophageal nodes, brachiocephalic nodes (anterior to the brachiocephalic veins in the superior mediastinum), and lateral aortic/lumbar nodes (in the abdomen). Superficial regions of the thoracic wall drain mainly into axillary lymph nodes in the axilla or parasternal nodes. Innervation of the thoracic wall i

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | Query targets parasternal nodes' function chunk directly states superficial thoracic wall drains into axillary or parasternal nodes, matching the brief. Optional extras are all pla |
| deepseek | 1 | 0 | 1 | Must target parasternal nodes is correct for the function query. Optional extras include clearly unrelated structures such as azygos vein and cephalic vein, not tied to parasternal |
| qwen | 1 | 0 | 1 | Optional list includes venous/neural structures (azygos vein, cephalic vein, intercostal nerves) not clearly required or plausibly related to parasternal node function. |
| **konsensus ≥2/3** | 1 | 0 | 1 | non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 18. `F-lymphoid-011`  (F · lymphoid)
**Query:** What is the function of the Spleen?
**Gold must:** `spleen`
**Gold optional:** 8 struktur — abdominalaorta, bileduct, diaphragm, gallbladder, greateromentum, liver, pancreas, splenicartery
**Gold chunk (potongan):** Both these ligaments are parts of the greater omentum. The spleen is surrounded by visceral peritoneum except in the area of the hilum on the medial surface of the spleen (Fig. 4.114). The splenic hilum is the entry point for the splenic vessels, and occasionally the tail of the pancreas reaches this area. The arterial supply to the spleen (Fig. 4.115) is the splenic artery from the celiac trunk.

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | weak_gold_chunk; Query is clear/answerable and 'spleen' is the correct required target optional extras are neighboring abdominal viscera/vessels from the same section, acceptable.  |
| deepseek | 1 | 0 | 1 | weak_gold_chunk; Spleen is the correct required target for a function query. Optional list includes several structures (liver, gallbladder, bile duct, abdominal aorta, diaphragm) n |
| qwen | 1 | 0 | 1 | weak_gold_chunk; Spleen is required, but optional includes unrelated/not-in-chunk structures (e.g., abdominalaorta, bileduct, gallbladder, liver) and the chunk covers anatomy not f |
| **konsensus ≥2/3** | 1 | 0 | 1 | weak_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 19. `F-nervous-016`  (F · nervous)
**Query:** Where is the Musculocutaneous nerve located?
**Gold must:** `musculocutaneousnerve`
**Gold optional:** 8 struktur — axillaryartery, axillarynerve, brachialismuscle, coracobrachialismuscle, dorsalscapularnerve, flexordigitorumprofundus, humerus, inferiorsubscapularnerve
**Gold chunk (potongan):** The musculocutaneous nerve, the lateral root of the median nerve, the median nerve, the medial root of the median nerve, and the ulnar nerve form an M over the third part of the axillary artery (Fig. 7.55). This feature, together with penetration of the coracobrachialis muscle by the musculocutaneous nerve, can be used to identify components of the brachial plexus in the axilla. Branches of the po

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | Query is a clear factual location question musculocutaneous nerve is the correct required target. Chunk directly describes its identifying relationships (M over third part of axill |
| deepseek | 1 | 0 | 1 | Must target (musculocutaneous nerve) is correct for the location query. Optional list includes flexor digitorum profundus, which is not related to the musculocutaneous nerve or the |
| qwen | 1 | 0 | 1 | Gold optional includes clearly unrelated structures for the musculocutaneous nerve location, especially flexor digitorum profundus. |
| **konsensus ≥2/3** | 1 | 0 | 1 | non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 20. `F-nervous-019`  (F · nervous)
**Query:** What is the Inferior subscapular nerve?
**Gold must:** `inferiorsubscapularnerve`
**Gold optional:** 8 struktur — axillaryartery, axillarynerve, dorsalscapularnerve, humerus, infraclavicularnodes, lateralpectoralnerve, latissimusdorsimuscle, longthoracicnerve
**Gold chunk (potongan):** Terminal nervesCordsDivisionsTrunksRoots (anterior rami)C5C6C7C8T1SuperiorMiddleInferiorLateralPosteriorPosteriorPosteriorPosteriorMedialAnteriorAnteriorAnterior ALateral pectoral nerveMedial pectoral nerveMedial cutaneous nerve of armMedial cutaneous nerve of forearmMusculocutaneousMedianRadialUlnarAxillaryLong thoracicnerveSuprascapular nerveDorsal scapular nerveContribution to phrenic nerveNerv

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | Well-posed factual query about a real posterior-cord branch must list correctly targets the queried nerve optional extras (axillary artery/nerve, pectoral/scapular nerves, latissim |
| deepseek | 1 | 1 | 1 | weak_gold_chunk; Gold must correctly targets the inferior subscapular nerve optional extras are plausibly related to the axillary/brachial plexus region. The gold chunk is essentia |
| qwen | 1 | 0 | 1 | weak_gold_chunk; Target nerve is correct and query is clear, but optional extras include unrelated axilla/bone/node/muscle items and the chunk is only a brachial plexus label list  |
| **konsensus ≥2/3** | 1 | 1 | 1 | weak_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 21. `F-visceral-001`  (F · visceral)
**Query:** What is the Submandibular duct?
**Gold must:** `submandibularduct`
**Gold optional:** 8 struktur — externalcarotidartery, externaljugularvein, facialvein, lingualnerve, mandible, parotidduct, parotidgland, sublingualgland
**Gold chunk (potongan):** The sublingual gland drains into the oral cavity via numerous small ducts (minor sublingual ducts), which open onto the crest of the sublingual fold. Occasionally, the more anterior part of the gland is drained by a duct (major sublingual duct) that opens together with the submandibular duct on the sublingual caruncle. Vessels that supply the parotid gland originate from the external carotid arter

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | weak_gold_chunk; Query is a clear factual definition question and 'submandibularduct' is the correct required target optional extras are all plausible same-region structures (saliv |
| deepseek | 1 | 1 | 1 | weak_gold_chunk; Gold must correctly targets submandibular duct for a factual query optional head/neck structures are plausibly related. Gold chunk is weak because it mainly descri |
| qwen | 1 | 0 | 1 | weak_gold_chunk; Gold must is correct for the queried structure, but optional includes clearly unrelated extras such as external jugular vein and facial vein, and broader salivary/ |
| **konsensus ≥2/3** | 1 | 1 | 1 | weak_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 22. `F-visceral-005`  (F · visceral)
**Query:** What is the function of the Kidney?
**Gold must:** `kidney`
**Gold optional:** 5 struktur — ilioinguinalnerve, spleen, suprarenalgland, transversalisfascia, ureter
**Gold chunk (potongan):** The kidneys project onto the back on either side of the midline and are related to the lower ribs (Fig. 4.183): The left kidney is a little higher than the right and reaches as high as rib XI. The superior pole of the right kidney reaches only as high as rib XII. The lower poles of the kidneys occur around the level of the disc between the LIII and LIV vertebrae. The hila of the kidneys and the be

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | weak_gold_chunk; Query is a clear factual question and 'kidney' is the correct required target optional extras (suprarenal gland, ureter, spleen, etc.) are plausible kidney-region  |
| deepseek | 1 | 0 | 1 | weak_gold_chunk; Kidney is the correct required target, but the gold chunk describes kidney position/relations, not function, so it is weak for a function query. Optional extras in |
| qwen | 1 | 1 | 1 | weak_gold_chunk; Kidney is the correct required target and optional structures are plausible kidney-related anatomy, but the query asks function while the chunk covers location/rel |
| **konsensus ≥2/3** | 1 | 1 | 1 | weak_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 23. `F-visceral-012`  (F · visceral)
**Query:** Where is the Epididymis located?
**Gold must:** `epididymis`
**Gold optional:** 8 struktur — ductusdeferens, ejaculatoryduct, externaliliacartery, externaliliacvein, inferiorepigastricartery, prostate, testis, ureter
**Gold chunk (potongan):** The epididymis courses along the posterolateral side of the testis (Fig. 5.47B). It has two distinct components: the efferent ductules, which form an enlarged coiled mass that sits on the posterior superior pole of the testis and forms the head of the epididymis; and the true epididymis, which is a single, long coiled duct into which the efferent ductules all drain, and which continues inferiorly

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | Factual location query is unambiguous 'epididymis' is the correct required target chunk directly describes its location along the posterolateral testis optional extras are plausibl |
| deepseek | 1 | 1 | 1 | Factual location query epididymis is the correct queried target, optional structures are plausibly related male pelvic/reproductive anatomy, and the chunk directly supports the ans |
| qwen | 0 | 0 | 1 | Gold must omits testis, which is required for the location answer optional includes unrelated vascular/ureteral/prostatic structures. |
| **konsensus ≥2/3** | 1 | 1 | 1 | non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 24. `F-visceral-015`  (F · visceral)
**Query:** What is the function of the Mesocolon?
**Gold must:** `mesocolon`
**Gold optional:** 8 struktur — ascendingcolon, commoniliacartery, descendingcolon, diaphragm, greateromentum, ileocolicartery, kidney, pancreas
**Gold chunk (potongan):** The transverse mesocolon is a fold of peritoneum that connects the transverse colon to the posterior abdominal wall (Fig. 4.61). Its two layers of peritoneum leave the posterior abdominal wall across the anterior surface of the head and body of the pancreas and pass outward to surround the transverse colon. Between its layers are the arteries, veins, nerves, and lymphatics related to the transvers

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | Query is a clear factual question about mesocolon function gold must correctly targets mesocolon optional extras are plausible same-topic structures (colon segments, pancreas, omen |
| deepseek | 1 | 1 | 1 | Query is well-posed gold must mesocolon is the correct required target optional structures are plausibly related abdominal/peritoneal anatomy gold chunk directly describes the tran |
| qwen | 1 | 0 | 1 | Mesocolon is the correct required target, but optional list includes several structures unrelated to the query/chunk (e.g. common iliac artery, kidney, diaphragm), so it is not acc |
| **konsensus ≥2/3** | 1 | 1 | 1 | non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 25. `F-visceral-019`  (F · visceral)
**Query:** What is the function of the Ductus deferens?
**Gold must:** `ductusdeferens`
**Gold optional:** 8 struktur — abdominalaorta, ejaculatoryduct, epididymis, externaliliacartery, externaliliacvein, femoralnerve, genitofemoralnerve, inferiorepigastricartery
**Gold chunk (potongan):** Between the ureter and ejaculatory duct, the ductus deferens expands to form the ampulla of the ductus deferens. The ejaculatory duct penetrates through the prostate gland to connect with the prostatic urethra. Each seminal vesicle is an accessory gland of the male reproductive system that develops as a blind-ended tubular outgrowth from the ductus deferens (Fig. 5.47A). The tube is coiled with nu

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | Query is a clear, well-posed factual question targeting the ductus deferens, which is correctly the sole required structure. Optional extras (epididymis, ejaculatory duct, and regi |
| deepseek | 1 | 0 | 1 | Optional list includes many structures (aorta, iliac vessels, femoral/genitofemoral nerves, inferior epigastric artery) unrelated to the function of the ductus deferens only ejacul |
| qwen | 1 | 0 | 1 | weak_gold_chunk; Gold must is correct, but optional includes structures unrelated to the function query/chunk (e.g. abdominal aorta, femoral nerve), and the chunk describes anatomy |
| **konsensus ≥2/3** | 1 | 0 | 1 | non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 26. `R-cardiovascular-003`  (R · cardiovascular)
**Query:** How are the Anterior cerebral artery and the Cavernous sinus anatomically related?
**Gold must:** `anteriorcerebralartery`, `cavernoussinus`
**Gold optional:** 3 struktur — middlemeningealartery, optictract, superiorsagittalsinus
**Gold chunk (potongan):** Neurovascular bundleV1V2Connected togetheras a structural unitSkinAponeurosisPeriosteum1234BoneOutertableInnertableDiploëAnterior cerebral arteryInternal carotidarteryDiploic veinSuperior sagittal sinusCavernous sinusOptic tractsDuraPeriostial layerMeningeal layerArachnoidSubarachnoid spacePiaEmissary vein: can spread infection fromthe scalp into the cranial cavityConnective tissue:contains majorn

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 0 | weak_gold_chunk; arbitrary_pair; ACA and cavernous sinus have no direct anatomical relationship (only an indirect link via the internal carotid artery, which is not even in gold mu |
| deepseek | 1 | 1 | 1 | weak_gold_chunk; arbitrary_pair; Both queried structures are correct targets, but the gold chunk is only a diagram-label list with no explanatory relation ACA and cavernous sinus a |
| qwen | 1 | 1 | 1 | weak_gold_chunk; Gold must correctly names both queried structures query is answerable via indirect ICA relationship. Optional extras are plausible meningeal/venous/optic structure |
| **konsensus ≥2/3** | 1 | 1 | 1 | weak_gold_chunk; arbitrary_pair; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 27. `R-muscular-003`  (R · muscular)
**Query:** How are the Extensor hallucis longus and the Flexor digitorum brevis anatomically related?
**Gold must:** `extensorhallucislongus`, `flexordigitorumbrevis`
**Gold optional:** 8 struktur — anteriortibialartery, deepplantarartery, dorsalispedisartery, extensordigitorum, extensordigitorumlongus, intermediatecuneiformbone, medialplantarartery, plantararch
**Gold chunk (potongan):** Near the base of metatarsal I, the medial plantar artery gives rise to a superficial branch, which divides into three vessels that pass superficial to the flexor digitorum brevis muscle to join the plantar metatarsal arteries from the deep plantar arch. The dorsalis pedis artery is the continuation of the anterior tibial artery and begins as the anterior tibial artery crosses the ankle joint (Fig.

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 0 | weak_gold_chunk; arbitrary_pair; Query names both structures so must list is correct, but EHL (anterior leg muscle, dorsal hallux tendon) and FDB (plantar intrinsic muscle) have no |
| deepseek | 1 | 1 | 1 | weak_gold_chunk; arbitrary_pair; The two muscles are named in the query and are correct targets, but the gold chunk only discusses the medial plantar artery and flexor digitorum br |
| qwen | 1 | 1 | 1 | weak_gold_chunk; Gold chunk mentions flexor digitorum brevis and nearby arteries but not extensor hallucis longus or their relationship, so it weakly supports the relational query. |
| **konsensus ≥2/3** | 1 | 1 | 1 | weak_gold_chunk; arbitrary_pair; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 28. `R-cardiovascular-008`  (R · cardiovascular)
**Query:** How are the Azygos vein and the Left gastric artery anatomically related?
**Gold must:** `azygosvein`, `leftgastricartery`
**Gold optional:** 3 struktur — diaphragm, hemiazygosvein, thoracicaorta
**Gold chunk (potongan):** Passing through the esophageal hiatus with the esophagus are the anterior and posterior vagal trunks, the esophageal branches of the left gastric artery and vein, and a few lymphatic vessels. The third large opening in the diaphragm is the caval opening, through which the inferior vena cava passes from the abdominal cavity to the thoracic cavity (Fig. 4.143) at approximately vertebra TVIII in the

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 0 | weak_gold_chunk; arbitrary_pair; Relational pair is arbitrary: the azygos vein has no direct anatomical relationship with the left gastric artery (the classic relationship is with  |
| deepseek | 1 | 1 | 1 | weak_gold_chunk; arbitrary_pair; Gold chunk mentions left gastric artery but not azygos vein, so weak support the pair lacks a meaningful relationship in the passage, making it arb |
| qwen | 1 | 1 | 1 | weak_gold_chunk; arbitrary_pair; Gold must is correct query is clear but the pair lacks a direct meaningful relationship, and the chunk supports only left gastric artery via esopha |
| **konsensus ≥2/3** | 1 | 1 | 1 | weak_gold_chunk; arbitrary_pair; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 29. `R-cardiovascular-012`  (R · cardiovascular)
**Query:** How are the Azygos vein and the Superior mesenteric artery anatomically related?
**Gold must:** `azygosvein`, `superiormesentericartery`
**Gold optional:** 8 struktur — abdominalaorta, diaphragm, duodenum, inferiormesentericartery, leftrenalvein, lumbarveins, pancreas, splenicvein
**Gold chunk (potongan):** Anterior to the abdominal aorta, as it descends, are the pancreas and splenic vein, the left renal vein, and the inferior part of the duodenum. Several left lumbar veins cross it posteriorly as they pass to the inferior vena cava. On its right side are the cisterna chyli, thoracic duct, azygos vein, right crus of the diaphragm, and the inferior vena cava. On its left side is the left crus of the d

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 0 | weak_gold_chunk; arbitrary_pair; Relational query pairs the azygos vein (posterior mediastinum, drains to SVC) with the superior mesenteric artery (abdominal aortic branch supplyin |
| deepseek | 1 | 1 | 1 | weak_gold_chunk; arbitrary_pair; Gold must lists both query endpoints, which are required to answer the relational question. Optional extras are from the same abdominal aorta passa |
| qwen | 1 | 1 | 0 | weak_gold_chunk; arbitrary_pair; Both named structures are required, but the pair lacks a direct meaningful relation and the gold chunk only describes azygos relations to the abdom |
| **konsensus ≥2/3** | 1 | 1 | 0 | weak_gold_chunk; arbitrary_pair; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 30. `R-joints-001`  (R · joints)
**Query:** How are the Pubic symphysis and the Sacrotuberous ligament anatomically related?
**Gold must:** `pubicsymphysis`, `sacrotuberousligament`
**Gold optional:** 8 struktur — coccyx, internalpudendalvein, obturatorinternus, prostate, pudendalnerve, sacrospinousligament, sacrum, ureter
**Gold chunk (potongan):** The diamond-shaped pelvic outlet is formed by both bone and ligaments (Fig. 5.6). It is limited anteriorly in the midline by the pubic symphysis. On each side, the inferior margin of the pelvic bone projects posteriorly and laterally from the pubic symphysis to end in a prominent tuberosity, the ischial tuberosity. Together, these elements construct the pubic arch, which forms the margin of the an

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | weak_gold_chunk; Query is a valid relational item: both structures are meaningful co-boundaries of the pelvic outlet (symphysis anteriorly, sacrotuberous ligament posterolaterally) |
| deepseek | 1 | 0 | 1 | weak_gold_chunk; Both gold must structures are required for the relational query, but the gold chunk only mentions the pubic symphysis and not the sacrotuberous ligament, making it |
| qwen | 1 | 0 | 1 | weak_gold_chunk; Optional extras include prostate/ureter, which are not clearly related to the pelvic-outlet boundary topic the chunk mentions pubic symphysis but not sacrotuberous |
| **konsensus ≥2/3** | 1 | 0 | 1 | weak_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 31. `R-cardiovascular-018`  (R · cardiovascular)
**Query:** How are the Azygos vein and the Marginal artery anatomically related?
**Gold must:** `azygosvein`, `marginalartery`
**Gold optional:** 8 struktur — commoniliacvein, externaliliacvein, inferiormesentericvein, internaliliacvein, liver, spleen, splenicvein, stomach
**Gold chunk (potongan):** Fig. 4.129 Arterial supply to the abdominal parts of the gastrointestinal system and to the spleen. Fig. 4.130 Enlarged marginal artery connecting the superior and inferior mesenteric arteries. Digital subtraction angiogram. Fig. 4.131 Portal vein. Fig. 4.132 Venous drainage of the abdominal portion of the gastrointestinal tract. Fig. 4.133 Portosystemic anastomoses. LiverSpleenSplenic veinSuperio

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 0 | weak_gold_chunk; arbitrary_pair; Azygos vein (thoracic venous drainage into SVC) and marginal artery (colonic arterial anastomosis of SMA/IMA) occupy different regions and systems  |
| deepseek | 1 | 0 | 1 | weak_gold_chunk; arbitrary_pair; Gold must names both queried structures, but the chunk is a figure caption about abdominal arterial/portal supply and does not mention the azygos v |
| qwen | 1 | 0 | 0 | weak_gold_chunk; arbitrary_pair; Azygos vein and marginal artery lack a meaningful direct anatomical relationship chunk mentions marginal artery but not azygos, and optional iliac  |
| **konsensus ≥2/3** | 1 | 0 | 0 | weak_gold_chunk; arbitrary_pair; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 32. `R-cardiovascular-021`  (R · cardiovascular)
**Query:** How are the Great saphenous vein and the Plantar arch anatomically related?
**Gold must:** `greatsaphenousvein`, `plantararch`
**Gold optional:** 8 struktur — dorsalmetatarsalarteries, fibula, lateralmalleolus, medialmalleolus, plantarmetatarsalarteries, saphenousnerve, smallsaphenousvein, tibia
**Gold chunk (potongan):** The dorsal metatarsal arteries connect with perforating branches from the deep plantar arch and similar branches from the plantar metatarsal arteries. There are interconnected networks of deep and superficial veins in the foot. The deep veins follow the arteries. Superficial veins drain into a dorsal venous arch on the dorsal surface of the foot over the metatarsals (Fig. 6.126): The great sapheno

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | arbitrary_pair; Both must structures are the named query targets. Optional extras (saphenous nerve, small saphenous vein, malleoli, tibia/fibula, metatarsal arteries) all plausibly |
| deepseek | 1 | 1 | 0 | weak_gold_chunk; arbitrary_pair; Gold must structures are the two named targets, but the query asks for a direct relationship between a superficial vein and a deep arterial arch th |
| qwen | 1 | 1 | 1 | Query asks relation between two named structures both are required. Chunk is foot vascular anatomy including plantar arch and great saphenous vein optional extras are plausibly rel |
| **konsensus ≥2/3** | 1 | 1 | 1 | arbitrary_pair; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 33. `R-cardiovascular-026`  (R · cardiovascular)
**Query:** How are the Anterior circumflex humeral artery and the Axillary vein anatomically related?
**Gold must:** `anteriorcircumflexhumeralartery`, `axillaryvein`
**Gold optional:** 8 struktur — axillaryartery, brachialartery, lateralthoracicartery, longheadofbicepsbrachii, longheadoftricepsbrachii, posteriorcircumflexhumeralartery, scapula, shortheadofbicepsbrachii
**Gold chunk (potongan):** Fig. 7.48 Contents of the axilla: muscles. Long head of biceps brachiiShort head of biceps brachiiTendon of biceps brachiiCoracobrachialisBicipital aponeurosisTransverse humeral ligament Fig. 7.49 Contents of the axilla: the axillary artery. Lower border of teres majorPectoralis minorLateral margin of rib ISubclaviusSubclavian artery1st part2nd part3rd partBrachial arteryAxillary artery Fig. 7.50

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | weak_gold_chunk; Must list exactly matches the two queried structures (both real axillary vessels with a describable spatial relationship: axillary vein lies medial to the axillary |
| deepseek | 1 | 1 | 0 | weak_gold_chunk; arbitrary_pair; Gold chunk is a figure caption about the axillary artery and never mentions the anterior circumflex humeral artery or axillary vein the queried pai |
| qwen | 1 | 1 | 1 | weak_gold_chunk; Gold chunk is only axilla/axillary artery figure captions and omits the queried artery and vein, so weak query and required targets are valid. |
| **konsensus ≥2/3** | 1 | 1 | 1 | weak_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 34. `R-visceral-003`  (R · visceral)
**Query:** How are the Gallbladder and the Ureter anatomically related?
**Gold must:** `gallbladder`, `ureter`
**Gold optional:** 7 struktur — diaphragm, kidney, liver, pancreas, spleen, stomach, suprarenalgland
**Gold chunk (potongan):** Abdominal viscera are either suspended in the peritoneal cavity by mesenteries or positioned between the cavity and the musculoskeletal wall (Fig. 4.1B). Abdominal viscera include: major elements of the gastrointestinal system—the caudal end of the esophagus, stomach, small and large intestines, liver, pancreas, and gallbladder; the spleen; components of the urinary system—kidneys and ureters; the

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 0 | arbitrary_pair; Gallbladder (biliary/GI) and ureter (retroperitoneal urinary) have no meaningful direct anatomical relationship the pair is an arbitrary co-occurrence drawn from a  |
| deepseek | 1 | 1 | 1 | arbitrary_pair; Gallbladder and ureter are both correct targets, but the pair is an arbitrary co-occurrence in a list of abdominal viscera with no specific anatomical relationship  |
| qwen | 1 | 1 | 1 | Gallbladder and ureter are both named as abdominal viscera in the chunk, making the relational query answerable optional extras are plausible abdominal-viscera/topic-related struct |
| **konsensus ≥2/3** | 1 | 1 | 1 | arbitrary_pair; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 35. `R-nervous-009`  (R · nervous)
**Query:** How are the Lacrimal gland and the Medulla oblongata anatomically related?
**Gold must:** `lacrimalgland`, `medullaoblongata`
**Gold optional:** 4 struktur — pons, softpalate, stylohyoidmuscle, tongue
**Gold chunk (potongan):** The facial nerve [VII] carries GSA, SA, GVE, and BE fibers: The GSA fibers provide sensory input from part of the external acoustic meatus and deeper parts of the auricle. The SA fibers are for taste from the anterior two-thirds of the tongue. The GVE fibers are part of the parasympathetic part of the autonomic division of the PNS and stimulate secretomotor activity in the lacrimal gland, submandi

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 0 | weak_gold_chunk; arbitrary_pair; Lacrimal gland and medulla oblongata are an arbitrary pair: secretomotor (GVE) supply to the lacrimal gland arises from the superior salivatory nuc |
| deepseek | 1 | 1 | 1 | weak_gold_chunk; arbitrary_pair; Both structures are named in the query and thus required targets, but the gold chunk only covers the lacrimal gland via facial nerve fibers and nev |
| qwen | 1 | 1 | 0 | weak_gold_chunk; arbitrary_pair; The query asks a relation between lacrimal gland and medulla oblongata, but no meaningful direct anatomical relation is supported chunk only covers |
| **konsensus ≥2/3** | 1 | 1 | 0 | weak_gold_chunk; arbitrary_pair; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 36. `R-muscular-009`  (R · muscular)
**Query:** How are the Extensor indicis and the Supraspinatus muscle anatomically related?
**Gold must:** `extensorindicis`, `supraspinatusmuscle`
**Gold optional:** 3 struktur — extensordigitiminimi, extensordigitorum, palm
**Gold chunk (potongan):** Extension of the index, middle, ring, and little fingers is performed by the extensor digitorum muscle. Placing the fist in a palm-down position on the table and pressing the middle phalanges onto the table effectively immobilizes the action of the extensor digitorum. The freshman was therefore unable to elevate his middle finger (which was sticking out). It is important to remember that if this s

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 0 | weak_gold_chunk; arbitrary_pair; Relational item pairs two muscles with no meaningful anatomical relationship (forearm extensor vs rotator cuff muscle) gold chunk only covers exten |
| deepseek | 1 | 1 | 1 | weak_gold_chunk; arbitrary_pair; Gold must lists the two queried muscles, so required targets are correct. Optional extras are plausible hand/forearm structures. Query is answerabl |
| qwen | 1 | 1 | 1 | weak_gold_chunk; arbitrary_pair; Gold chunk is about extensor digitorum/palm and omits supraspinatus the queried pair has no direct anatomical relationship. |
| **konsensus ≥2/3** | 1 | 1 | 1 | weak_gold_chunk; arbitrary_pair; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 37. `R-visceral-004`  (R · visceral)
**Query:** How are the Liver and the Transverse colon anatomically related?
**Gold must:** `liver`, `transversecolon`
**Gold optional:** 8 struktur — ascendingcolon, descendingcolon, diaphragm, duodenum, gallbladder, pancreas, sigmoidcolon, spleen
**Gold chunk (potongan):** At the junction of the ascending and transverse colon is the right colic flexure, which is just inferior to the right lobe of the liver (Fig. 4.89). A similar, but more acute bend (the left colic flexure) occurs at the junction of the transverse and descending colon. This bend is just inferior to the spleen, is higher and more posterior than the right colic flexure, and is attached to the diaphrag

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | Query asks a valid relational question liver and transverse colon have a genuine anatomical relationship (right colic/hepatic flexure lies just inferior to the right lobe of the li |
| deepseek | 1 | 1 | 1 |  |
| qwen | 1 | 0 | 1 | Optional includes sigmoid colon and other non-passage viscera not clearly related to the liver-transverse colon relationship. |
| **konsensus ≥2/3** | 1 | 1 | 1 | non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 38. `R-cardiovascular-033`  (R · cardiovascular)
**Query:** How are the Superior thyroid vein and the Thyrocervical trunk anatomically related?
**Gold must:** `superiorthyroidvein`, `thyrocervicaltrunk`
**Gold optional:** 4 struktur — externalcarotidartery, internaljugularvein, thyroidcartilage, trachea
**Gold chunk (potongan):** The major blood supply to the larynx is by the superior and inferior laryngeal arteries (Fig. 8.226): The superior laryngeal artery originates near the upper margin of the thyroid cartilage from the superior thyroid branch of the external carotid artery, and accompanies the internal branch of the superior laryngeal nerve through the thyrohyoid membrane to reach the larynx. The inferior laryngeal a

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 0 | weak_gold_chunk; arbitrary_pair; Must list matches the query pair exactly, and optional extras (ECA, IJV, thyroid cartilage, trachea) are plausible same-region structures. However, |
| deepseek | 1 | 1 | 1 | weak_gold_chunk; arbitrary_pair; Gold chunk discusses the superior laryngeal artery, not the queried superior thyroid vein or thyrocervical trunk. The pair has no direct anatomical |
| qwen | 1 | 1 | 1 | weak_gold_chunk; arbitrary_pair; Both named structures are required by the query, but the gold chunk concerns superior laryngeal/superior thyroid artery and does not support a dire |
| **konsensus ≥2/3** | 1 | 1 | 1 | weak_gold_chunk; arbitrary_pair; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 39. `R-muscular-012`  (R · muscular)
**Query:** How are the Calcaneal tendon and the Extensor hallucis longus anatomically related?
**Gold must:** `calcanealtendon`, `extensorhallucislongus`
**Gold optional:** 6 struktur — anteriortibialartery, deepfibularnerve, fibula, lateralmalleolus, medialmalleolus, tibia
**Gold chunk (potongan):** Fig. 6.93 Muscles of the anterior compartment of leg. Anterior surfaceof fibulaExtensordigitorumlongusOrigin of extensordigitorum longusLateral surfaceof fibulaExtensor hallucis longusOrigin of extensorhallucis longusFibularistertiusAttachment to inferior surface of medial cuneiform and metatarsal ISubcutaneoussurface of tibiaTibialisanteriorOrigin of tibialisanterior Fig. 6.94 Anterior tibial art

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 0 | weak_gold_chunk; arbitrary_pair; Calcaneal tendon (posterior compartment/Achilles) and extensor hallucis longus (anterior compartment) have no meaningful direct relationship — the  |
| deepseek | 1 | 1 | 1 | weak_gold_chunk; arbitrary_pair; Gold must are the two queried structures, but the chunk only covers the anterior compartment and never mentions the calcaneal tendon the pair is an |
| qwen | 1 | 1 | 1 | weak_gold_chunk; Gold chunk covers anterior compartment/EHL but omits calcaneal tendon, making it weak for the relational query required and optional structures are plausible. |
| **konsensus ≥2/3** | 1 | 1 | 1 | weak_gold_chunk; arbitrary_pair; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 40. `R-cardiovascular-036`  (R · cardiovascular)
**Query:** How are the Right ascending lumbar vein and the Superior vena cava anatomically related?
**Gold must:** `rightascendinglumbarvein`, `superiorvenacava`
**Gold optional:** 8 struktur — azygosvein, diaphragm, leftsubclavianartery, leftsuperiorintercostalvein, rightsubcostalvein, rightsuperiorintercostalvein, sympathetictrunk, thoracicaorta
**Gold chunk (potongan):** There is significant variation in the origin, course, tributaries, anastomoses, and termination of these vessels. The azygos vein arises opposite vertebra LI or LII at the junction between the right ascending lumbar vein and the right subcostal vein (Fig. 3.102). It may also arise as a direct branch of the inferior vena cava, which is joined by a common trunk from the junction of the right ascendi

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | Pair is meaningful: right ascending lumbar vein joins right subcostal vein to form the azygos vein, which drains into the superior vena cava, so both query-named structures are gen |
| deepseek | 1 | 1 | 1 | weak_gold_chunk; Gold chunk describes azygos origin from right ascending lumbar vein but does not mention superior vena cava, so it weakly supports the full relational query the pa |
| qwen | 1 | 0 | 1 | Optional includes leftsubclavianartery and other items not clearly related to the right ascending lumbar vein–SVC relation query is answerable via the azygos pathway. |
| **konsensus ≥2/3** | 1 | 1 | 1 | non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 41. `A-muscular-001`  (A · muscular)
**Query:** What is the Common tendinous ring?
**Gold must:** `commontendinousring`
**Gold optional:** 8 struktur — cavernoussinus, inferiorobliquemuscle, inferiorrectusmuscle, lateralrectusmuscle, levatorpalpebraesuperioris, medialrectusmuscle, midbrain, pons
**Gold chunk (potongan):** The orientation and actions of the medial and lateral rectus muscles are more straightforward than those of the superior and inferior rectus muscles. The medial rectus originates from the medial part of the common tendinous ring medial to and below the optic canal, whereas the lateral rectus originates from the lateral part of the common tendinous ring as the common tendinous ring bridges the supe

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 0 | 0 | Query is a plain factual definition, not a valid ambiguity/negative control despite being typed A. Optional list includes unrelated structures (midbrain, pons, cavernous sinus) not |
| deepseek | 1 | 0 | 1 | Optional extras include midbrain, pons, and cavernous sinus, which are not related to the common tendinous ring only extraocular muscles arising from/near the ring are plausible. |
| qwen | 1 | 0 | 0 | Query is a straightforward factual definition, not an ambiguity/negative control for type A optional includes unrelated/wrong structures such as midbrain, pons, and inferior obliqu |
| **konsensus ≥2/3** | 1 | 0 | 0 | non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 42. `A-nervous-003`  (A · nervous)
**Query:** What is the Sulcus interm_prim-Jensen?
**Gold must:** `sulcusintermprimjensen`
**Gold optional:** 0 struktur — 
**Gold chunk (potongan):** 

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 0 | 1 | 0 | no_gold_chunk; Query term 'Sulcus interm_prim-Jensen' is garbled/non-existent anatomy (looks like a corrupted token, not a real sulcus) marking it as gold must is wrong for any ite |
| deepseek | 1 | 1 | 1 | no_gold_chunk; Gold must matches the queried structure no gold chunk provided (negative control). |
| qwen | 0 | 1 | 1 | no_gold_chunk; The query appears to be a valid negative-control style request for an unclear/nonstandard term, but the gold must list a non-anatomical/garbled term as a required st |
| **konsensus ≥2/3** | 0 | 1 | 1 | no_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 43. `A-muscular-002`  (A · muscular)
**Query:** What is the Adductor magnus?
**Gold must:** `adductormagnus`
**Gold optional:** 8 struktur — adductorbrevis, adductorlongus, femoralnerve, femur, iliacusmuscle, inguinalligament, obturatorexternus, obturatornerve
**Gold chunk (potongan):** The adductor brevis adducts and medially rotates the thigh at the hip joint and is innervated by the obturator nerve. The adductor magnus is the largest and deepest of the muscles in the medial compartment of the thigh (Fig. 6.62). The muscle forms the distal posterior wall of the adductor canal. Like the adductor longus and brevis muscles, the adductor magnus is a triangular or fan-shaped muscle

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | Query is a clear factual 'what is' question targeting adductor magnus gold must is correct. Optional extras are all plausible thigh/hip-region structures related to the same passag |
| deepseek | 1 | 0 | 1 | Gold must is correct for the definition question. Optional list includes structures not related to the adductor magnus/medial thigh passage, such as iliacus muscle, inguinal ligame |
| qwen | 1 | 0 | 0 | gold must is correct, but optional includes unrelated structures (e.g., iliacus muscle, inguinal ligament) query is a plain factual question, not an ambiguity/negative control as i |
| **konsensus ≥2/3** | 1 | 0 | 1 | non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 44. `A-muscular-003`  (A · muscular)
**Query:** What is the Tensor fasciae latae?
**Gold must:** `tensorfasciaelatae`
**Gold optional:** 8 struktur — adductormagnus, fascialata, femoralnerve, femur, fibula, glutealregion, gluteusmaximusmuscle, iliotibialtract
**Gold chunk (potongan):** The tensor fasciae latae originates from the outer margin of the iliac crest from the anterior superior iliac spine to approximately the tuberculum of the iliac crest. The muscle fibers descend to insert into the anterior aspect of the iliotibial tract of deep fascia, which runs down the lateral side of the thigh and attaches to the upper tibia. Like the gluteus maximus muscle, the tensor fasciae

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | Query is a clear, answerable factual definition question whose sole required target (tensor fasciae latae) is correct optional extras (fascia lata, IT tract, gluteus maximus, glute |
| deepseek | 1 | 0 | 1 | Gold must is correct: the query asks about the tensor fasciae latae itself. Optional list includes clearly unrelated/incorrect extras for this passage, e.g. fibula is not involved  |
| qwen | 1 | 0 | 0 | Gold must is correct, but optional includes several unrelated extras (e.g., adductor magnus, femoral nerve, fibula). Query is a plain factual definition, not a valid ambiguity/nega |
| **konsensus ≥2/3** | 1 | 0 | 1 | non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 45. `A-joints-001`  (A · joints)
**Query:** What is the Sacrotuberous ligament?
**Gold must:** `sacrotuberousligament`
**Gold optional:** 8 struktur — coccyx, glutealregion, obturatorinternus, piriformismuscle, pubicsymphysis, pudendalnerve, sacrospinousligament, sacrum
**Gold chunk (potongan):** The walls of the pelvic cavity consist of the sacrum, the coccyx, the pelvic bones inferior to the linea terminalis, two ligaments, and two muscles. Ligaments of the pelvic wall The sacrospinous and sacrotuberous ligaments (Fig. 5.29A) are major components of the lateral pelvic walls that help define the apertures between the pelvic cavity and adjacent regions through which structures pass. The sm

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | Query is a clear, unambiguous factual definition request targeting the sacrotuberous ligament gold must is correct. Optional extras are plausible pelvic-wall/adjacent-region struct |
| deepseek | 1 | 1 | 1 | Factual definition query sacrotuberous ligament is the required target and the optional pelvic-related structures are reasonable extras. The gold chunk directly discusses the ligam |
| qwen | 1 | 1 | 0 | A item but query is straightforward factual, not ambiguity/negative. |
| **konsensus ≥2/3** | 1 | 1 | 1 | non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 46. `A-regions-032`  (A · regions)
**Query:** What is the Tragus?
**Gold must:** `tragus`
**Gold optional:** 8 struktur — antihelix, antitragus, helix, intertragicincisure, lacrimalsac, nasolacrimalduct, oralregion, temporalregion
**Gold chunk (potongan):** The external ear consists of two parts. The part projecting from the side of the head is the auricle (pinna) and the canal leading inward is the external acoustic meatus. The auricle is on the side of the head and assists in capturing sound. It consists of cartilage covered with skin and arranged in a pattern of various elevations and depressions (Fig. 8.114). The large outside rim of the auricle

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | Query 'What is the Tragus?' is a clear, answerable definitional question with target 'tragus' matching gold must (though item is labeled type A, it reads as a clean factual query). |
| deepseek | 1 | 0 | 1 | weak_gold_chunk; Gold must 'tragus' is correct, and the query is clear/answerable. But optional includes clearly unrelated structures (lacrimal sac, nasolacrimal duct, oral/tempora |
| qwen | 1 | 0 | 0 | weak_gold_chunk; Query is direct factual, not a valid A ambiguity/negative chunk omits tragus optional includes unrelated lacrimal/oral structures. |
| **konsensus ≥2/3** | 1 | 0 | 1 | weak_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 47. `A-skeletal-001`  (A · skeletal)
**Query:** What is the Patella?
**Gold must:** `patella`
**Gold optional:** 7 struktur — commonfibularnerve, fibula, fibularcollateralligament, posteriorcruciateligament, sartoriusmuscle, semitendinosusmuscle, tibia
**Gold chunk (potongan):** The patellar ligament is functionally the continuation of the quadriceps femoris tendon below the patella and is attached above to the apex and margins of the patella and below to the tibial tuberosity (Fig. 6.59). The more superficial fibers of the quadriceps femoris tendon and the patellar ligament are continuous over the anterior surface of the patella, and lateral and medial fibers are continu

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | Query is a clear factual definition question with 'patella' as the correct required target optional extras are all knee-region structures plausibly co-occurring with the patella/pa |
| deepseek | 1 | 1 | 0 | weak_gold_chunk; Item typed A but query is a straightforward factual definition, not a valid ambiguity or negative control. Gold chunk concerns the patellar ligament rather than de |
| qwen | 1 | 0 | 0 | weak_gold_chunk; Gold must is correct optional list includes many knee/leg structures unrelated to the patella/patellar ligament topic query is straightforward factual despite A am |
| **konsensus ≥2/3** | 1 | 1 | 0 | weak_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 48. `A-regions-001`  (A · regions)
**Query:** that muscle.
**Gold must:** 
**Gold optional:** 0 struktur — 
**Gold chunk (potongan):** 

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 0 | 1 | 0 | no_gold_chunk; Query is a garbled fragment ('that muscle.') with no HISTORY or antecedent, so its target is unresolvable — not a valid ambiguity or negative control. Gold must is e |
| deepseek | 1 | 1 | 0 | no_gold_chunk; Query is a context-dependent fragment ('that muscle.') with no prior history, so its target is unclear and unanswerable as asked. Gold must/optional are empty, and n |
| qwen | 1 | 1 | 0 | no_gold_chunk; Query 'that muscle.' lacks antecedent/context and is unanswerable no gold chunk provided. |
| **konsensus ≥2/3** | 1 | 1 | 0 | no_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 49. `A-regions-003`  (A · regions)
**Query:** the nerve.
**Gold must:** 
**Gold optional:** 0 struktur — 
**Gold chunk (potongan):** 

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 0 | no_gold_chunk; Query 'the nerve.' is a garbled, unresolvable fragment with no identifiable target, so it fails as an ambiguity/negative-control item (query_ok=0) gold must/optional |
| deepseek | 1 | 1 | 0 | no_gold_chunk; Query 'the nerve' is too underspecified to be a resolvable ambiguity no gold chunk or brief is provided. |
| qwen | 1 | 1 | 1 | no_gold_chunk; A negative control: underspecified 'the nerve' with no required structures gold chunk absent. |
| **konsensus ≥2/3** | 1 | 1 | 0 | no_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 50. `A-regions-005`  (A · regions)
**Query:** the joint.
**Gold must:** 
**Gold optional:** 0 struktur — 
**Gold chunk (potongan):** 

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | no_gold_chunk; Query 'the joint.' is a maximally underspecified negative control: no specific joint is identifiable, so empty gold must/optional is correct and the expected behavio |
| deepseek | 1 | 1 | 0 | no_gold_chunk; Query 'the joint' is too vague/underspecified to have a clear, answerable target no gold structures, brief, or chunk are provided. |
| qwen | 1 | 1 | 0 | no_gold_chunk; Query 'the joint.' is too vague/unanswerable as an ambiguity/negative item no gold chunk provided. |
| **konsensus ≥2/3** | 1 | 1 | 0 | no_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 51. `A-regions-011`  (A · regions)
**Query:** the joint.
**Gold must:** 
**Gold optional:** 0 struktur — 
**Gold chunk (potongan):** 

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 0 | no_gold_chunk; Query 'the joint.' is a bare fragment with no context or history it is not a resolvable ambiguity or a valid negative control, so it is unanswerable as asked. Gold m |
| deepseek | 1 | 1 | 0 | no_gold_chunk; Query 'the joint.' is too vague/unresolvable with no context or specified joint gold chunk is absent. |
| qwen | 1 | 1 | 1 | no_gold_chunk; Gold lists are empty and no chunk is provided. As an A-type item, the bare phrase 'the joint.' is an underspecified clarification/negative control rather than a fact |
| **konsensus ≥2/3** | 1 | 1 | 0 | no_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 52. `A-regions-013`  (A · regions)
**Query:** that muscle.
**Gold must:** 
**Gold optional:** 0 struktur — 
**Gold chunk (potongan):** 

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 0 | 1 | 0 | no_gold_chunk; Query is a garbled fragment ('that muscle.') with no antecedent or history target is unclear and it is not a valid ambiguity or negative control. Gold must is empty  |
| deepseek | 1 | 1 | 0 | no_gold_chunk; Query is a fragment ('that muscle.') with no antecedent/history, so its target is unclear and unanswerable gold must/optional are empty, and no gold chunk is present |
| qwen | 1 | 1 | 0 | weak_gold_chunk; no_gold_chunk; Query 'that muscle' lacks antecedent and is unanswerable gold chunk absent. |
| **konsensus ≥2/3** | 1 | 1 | 0 | no_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 53. `A-regions-017`  (A · regions)
**Query:** Tell me more about one of them.
**History:** [{'role': 'user', 'text': 'Name the bones that form the elbow joint.'}, {'role': 'assistant', 'text': 'The elbow joint involves the humerus, the radius and the ulna.'}]
**Gold must:** 
**Gold optional:** 0 struktur — 
**Gold chunk (potongan):** 

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 0 | no_gold_chunk; Query is a vague anaphoric follow-up: 'one of them' leaves the target indeterminate (humerus vs radius vs ulna) with no cue to resolve it, so it is neither a resolva |
| deepseek | 1 | 1 | 0 | no_gold_chunk; Query's 'one of them' ambiguously refers to humerus, radius, or ulna and lacks a resolvable target. No gold chunk or brief provided. |
| qwen | 1 | 1 | 1 | no_gold_chunk; Gold must/optional are empty, vacuously correct. Query is a valid ambiguous follow-up. Gold chunk is absent. |
| **konsensus ≥2/3** | 1 | 1 | 0 | no_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 54. `A-regions-021`  (A · regions)
**Query:** Tell me more about one of them.
**History:** [{'role': 'user', 'text': 'Which nerves supply the forearm?'}, {'role': 'assistant', 'text': 'The forearm is supplied by the median, ulnar and radial nerves.'}]
**Gold must:** 
**Gold optional:** 0 struktur — 
**Gold chunk (potongan):** 

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 0 | no_gold_chunk; Query 'Tell me more about one of them' is an unresolvable anaphoric follow-up: 'one of them' could be any of the median, ulnar, or radial nerves and context gives no |
| deepseek | 1 | 1 | 1 | no_gold_chunk; No gold chunk provided query is a valid ambiguity item because 'one of them' refers to the previously listed median, ulnar, and radial nerves. |
| qwen | 1 | 1 | 1 | no_gold_chunk; Ambiguous follow-up referencing one of three nerves no specific gold structure required. Gold chunk is absent. |
| **konsensus ≥2/3** | 1 | 1 | 1 | no_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 55. `A-regions-027`  (A · regions)
**Query:** Tell me more about one of them.
**History:** [{'role': 'user', 'text': 'Which nerves supply the forearm?'}, {'role': 'assistant', 'text': 'The forearm is supplied by the median, ulnar and radial nerves.'}]
**Gold must:** 
**Gold optional:** 0 struktur — 
**Gold chunk (potongan):** 

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | no_gold_chunk; Valid ambiguity/negative item: 'one of them' anaphorically refers to median/ulnar/radial nerves, so correctly no single required or optional structure however, no go |
| deepseek | 1 | 1 | 0 | no_gold_chunk; Follow-up 'one of them' is ambiguous because the prior answer names three nerves and does not specify which one no gold chunk is provided. |
| qwen | 1 | 1 | 1 | no_gold_chunk; Empty gold must/optional is acceptable for an ambiguous follow-up query is validly ambiguous because 'one of them' could refer to median, ulnar, or radial nerve. Gol |
| **konsensus ≥2/3** | 1 | 1 | 1 | no_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)

### 56. `A-regions-029`  (A · regions)
**Query:** Tell me more about one of them.
**History:** [{'role': 'user', 'text': 'Name the bones that form the elbow joint.'}, {'role': 'assistant', 'text': 'The elbow joint involves the humerus, the radius and the ulna.'}]
**Gold must:** 
**Gold optional:** 0 struktur — 
**Gold chunk (potongan):** 

| Rater | must_ok | optional_ok | query_ok | catatan (dipotong) |
|---|---|---|---|---|
| glm | 1 | 1 | 1 | no_gold_chunk; Follow-up 'one of them' resolves via history to the three elbow bones (humerus, radius, ulna) as an A-item the underspecification is valid and resolvable (system sho |
| deepseek | 1 | 1 | 1 | no_gold_chunk; Gold must/optional lists are empty, so they pass vacuously. The follow-up refers anaphorically to the elbow bones and is an under-specified but valid ambiguity resol |
| qwen | 1 | 1 | 0 | no_gold_chunk; The follow-up query is ambiguous because 'one of them' does not specify which bone no gold chunk is present. |
| **konsensus ≥2/3** | 1 | 1 | 1 | no_gold_chunk; non_unanimous_see_arbitration |

> **Keputusan Anda →** must_ok __ · optional_ok __ · query_ok __ (isi di CSV)
