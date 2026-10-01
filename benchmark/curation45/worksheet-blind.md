# curated45 — Blind Validation Worksheet

**Penilai:** penulis (satu-satunya lapisan independen).  
**Instrumen:** kandidat = top-8 embedding retrieval (openai/text-embedding-3-small) atas 3017 chunk corpus (sha256 `52f0e5b03eba…`).  
**Buta:** urutan kandidat diacak deterministik per item; usulan & alasan GLM-5.3 serta pre-screen agent TIDAK ADA di dokumen ini — keduanya baru di-reveal setelah keputusanmu terkunci di `curation45-decisions.csv`.

## Cara mengisi

Untuk setiap item, pilih SATU keputusan dan isi barisnya di `curation45-decisions.csv`:

| Keputusan | Artinya | Kolom `decision` |
|---|---|---|
| Ganti dengan kandidat terbaik | chunk ini benar-benar memuat informasi untuk menjawab query | `chunk` + isi `chosen_chunk_id` |
| Pertahankan kunci lama | kamu tidak setuju dengan panel; chunk lama cukup layak | `keep_current` |
| Tidak ada yang layak | tidak ada kandidat (atau kunci lama) yang memuat informasinya | `none` → item jadi gold-less |
| Item bermasalah | query-nya sendiri cacat (mis. pasangan relasional arbitrer) — perbaikannya revisi item, bukan ganti chunk | `item_flawed` + catat di `notes` |

**Kriteria "layak":** chunk memuat informasi yang ditanya query — bukan sekadar menyebut nama struktur. Dump keterangan gambar, daftar istilah, dan sebutan sepintas TIDAK layak.
**Disiplin scope:** putuskan gold chunk ID saja. Jangan mengubah query/gold structures lewat jalur ini.

> Statistik agregat proposal GLM-5.3 (tanpa identitas item): 45 item; total usulan 24; usulan "tidak ada yang layak" 32 item. Angka ini tidak mengikat — nilai sendiri setiap item.

---

## A-regions-032  (A/regions)

**QUERY:** What is the Tragus?

**MUST-HAVE:** tragus

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:2273, medrag-anatomy_gray:2676, medrag-anatomy_gray:2807

**Teks kunci lama `medrag-anatomy_gray:2273`:**

> The external ear consists of two parts. The part projecting from the side of the head is the auricle (pinna) and the canal leading inward is the external acoustic meatus. The auricle is on the side of the head and assists in capturing sound. It consists of cartilage covered with skin and arranged in a pattern of various elevations and depressions (Fig. 8.114). The large outside rim of the auricle 

**Teks kunci lama `medrag-anatomy_gray:2676`:**

> The lacrimal sac is in the lacrimal fossa on the medial side of the orbit. From the lacrimal sac, tears drain via the nasolacrimal duct into the nasal cavity. The external ear (Fig. 8.291) consists of the auricle and the external acoustic meatus. The auricle is supported by cartilage and is covered by skin. The external acoustic meatus is near the anterior margin of the auricle. The auricle is cha

**Teks kunci lama `medrag-anatomy_gray:2807`:**

> In the clinic Facelift surgery (rhytidectomy) aims to lift up and pull back the skin in the lower half of the face and neck to make the face more taught. Careful placement of the incisions is important to ensure there is no skin or facial distortion and to avoid hair loss. The commonest incisions are placed in the temporal region on each side, extending to the helices of the ears, then tracking be

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:2676`** — hal. 0, chunk 2676

> The lacrimal sac is in the lacrimal fossa on the medial side of the orbit. From the lacrimal sac, tears drain via the nasolacrimal duct into the nasal cavity. The external ear (Fig. 8.291) consists of the auricle and the external acoustic meatus. The auricle is supported by cartilage and is covered by skin. The external acoustic meatus is near the anterior margin of the auricle. The auricle is cha

**[B] `medrag-anatomy_gray:2276`** — hal. 0, chunk 2276

> Lymphatic drainage of the auricle passes anteriorly into parotid nodes and posteriorly into mastoid nodes, and possibly into the upper deep cervical nodes. The external acoustic meatus extends from the deepest part of the concha to the tympanic membrane (eardrum), a distance of approximately 1 inch (2.5 cm) (Fig. 8.116). Its walls consist of cartilage and bone. The lateral one-third is formed from

**[C] `medrag-anatomy_gray:2594`** — hal. 0, chunk 2594

> The inferior aspect of the temporal bone has a triangular roughened area immediately anteromedial to the opening of the carotid canal (Fig. 8.248A). The levator veli palatini muscle of the soft palate is attached here. Cartilaginous part of the pharyngotympanic tube The trumpet-shaped cartilaginous part of the pharyngotympanic tube is in a groove between the anterior margin of the petrous part of 

**[D] `medrag-anatomy_gray:2273`** — hal. 0, chunk 2273

> The external ear consists of two parts. The part projecting from the side of the head is the auricle (pinna) and the canal leading inward is the external acoustic meatus. The auricle is on the side of the head and assists in capturing sound. It consists of cartilage covered with skin and arranged in a pattern of various elevations and depressions (Fig. 8.114). The large outside rim of the auricle 

**[E] `medrag-anatomy_gray:317`** — hal. 0, chunk 317

> The tubercle projects posteriorly from the junction of the neck with the shaft and consists of two regions, an articular part and a nonarticular part: The articular part is medial and has an oval facet for articulation with a corresponding facet on the transverse process of the associated vertebra. The raised nonarticular part is roughened by ligament attachments. The shaft is generally thin and f

**[F] `medrag-anatomy_gray:2278`** — hal. 0, chunk 2278

> The tympanic membrane separates the external acoustic meatus from the middle ear (Figs. 8.117 and 8.118). It is at an angle, sloping medially from top to bottom and posteriorly to anteriorly. Its lateral surface therefore faces inferiorly and anteriorly. It consists of a connective tissue core lined with skin on the outside and mucous membrane on the inside. Around the periphery of the tympanic me

**[G] `medrag-anatomy_gray:2498`** — hal. 0, chunk 2498

> The opening of the pharyngotympanic tube is posterior to and slightly above the level of the hard palate, and lateral to the top of the soft palate (Fig. 8.205A). Because the pharyngotympanic tube projects into the nasopharynx from a posterolateral direction, its posterior rim forms an elevation or bulge on the pharyngeal wall. Posterior to this tubal elevation (torus tubarius) is a deep recess (p

**[H] `medrag-anatomy_gray:2289`** — hal. 0, chunk 2289

> The mucous membrane lining the mastoid air cells is continuous with the mucous membrane throughout the middle ear. Therefore infections in the middle ear can easily spread into the mastoid area. The pharyngotympanic tube connects the middle ear with the nasopharynx (Fig. 8.122) and equalizes pressure on both sides of the tympanic membrane. Its opening in the middle ear is on the anterior wall, and

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## A-skeletal-001  (A/skeletal)

**QUERY:** What is the Patella?

**MUST-HAVE:** patella

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:1381, medrag-anatomy_gray:1537, medrag-anatomy_gray:1418

**Teks kunci lama `medrag-anatomy_gray:1381`:**

> The patellar ligament is functionally the continuation of the quadriceps femoris tendon below the patella and is attached above to the apex and margins of the patella and below to the tibial tuberosity (Fig. 6.59). The more superficial fibers of the quadriceps femoris tendon and the patellar ligament are continuous over the anterior surface of the patella, and lateral and medial fibers are continu

**Teks kunci lama `medrag-anatomy_gray:1537`:**

> Identifying structures around the knee The patella is a prominent palpable feature at the knee. The quadriceps femoris tendon attaches superiorly to it and the patellar ligament connects the inferior surface of the patella to the tibial tuberosity (Fig. 6.131). The patellar ligament and the tibial tuberosity are easily palpable. A tap on the patellar ligament (tendon) tests reflex activity mainly 

**Teks kunci lama `medrag-anatomy_gray:1418`:**

> The major ligaments associated with the knee joint are the patellar ligament, the tibial (medial) and fibular (lateral) collateral ligaments, and the anterior and posterior cruciate ligaments. The patellar ligament is basically the continuation of the quadriceps femoris tendon inferior to the patella (Fig. 6.76). It is attached above to the margins and apex of the patella and below to the tibial t

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:1381`** — hal. 0, chunk 1381

> The patellar ligament is functionally the continuation of the quadriceps femoris tendon below the patella and is attached above to the apex and margins of the patella and below to the tibial tuberosity (Fig. 6.59). The more superficial fibers of the quadriceps femoris tendon and the patellar ligament are continuous over the anterior surface of the patella, and lateral and medial fibers are continu

**[B] `medrag-anatomy_gray:1537`** — hal. 0, chunk 1537

> Identifying structures around the knee The patella is a prominent palpable feature at the knee. The quadriceps femoris tendon attaches superiorly to it and the patellar ligament connects the inferior surface of the patella to the tibial tuberosity (Fig. 6.131). The patellar ligament and the tibial tuberosity are easily palpable. A tap on the patellar ligament (tendon) tests reflex activity mainly 

**[C] `medrag-anatomy_gray:1417`** — hal. 0, chunk 1417

> Anteriorly, the fibrous membrane is attached to the margins of the patella where it is reinforced with tendinous expansions from the vastus lateralis and vastus medialis muscles, which also merge above with the quadriceps femoris tendon and below with the patellar ligament. The fibrous membrane is reinforced anterolaterally by a fibrous extension from the iliotibial tract and posteromedially by an

**[D] `medrag-anatomy_gray:1442`** — hal. 0, chunk 1442

> The popliteus is the smallest and most superior of the deep muscles in the posterior compartment of the leg. It unlocks the extended knee at the initiation of flexion and stabilizes the knee by resisting lateral (external) rotation of the tibia on the femur. It is flat and triangular in shape, forms part of the floor of the popliteal fossa (Fig. 6.88), and is inserted into a broad triangular regio

**[E] `medrag-anatomy_gray:1565`** — hal. 0, chunk 1565

> Fig. 6.54 Patella. A. Anterior view. B. Posterior view. C. Superior view. Fig. 6.55 Proximal end of the tibia. A. Superior view, tibial plateau. B. Anterior view. C. Posterior view. D. Cross section through the shaft of tibia. AIntercondylar regionAttachment of posterior cruciate ligamentPosterior attachment of lateral meniscusArea of articulation with lateral meniscusAnterior attachment of latera

**[F] `medrag-anatomy_gray:1364`** — hal. 0, chunk 1364

> The upper facet is for attachment of the lateral head of the gastrocnemius muscle. The inferior facet is for attachment of the popliteus muscle. The tendon of the popliteus muscle lies in the groove separating the two facets. The medial epicondyle is a rounded eminence on the medial surface of the medial condyle. Just posterosuperior to the medial epicondyle is the adductor tubercle. The patella (

**[G] `medrag-anatomy_gray:1414`** — hal. 0, chunk 1414

> Anteriorly, the synovial membrane is separated from the patellar ligament by an infrapatellar fat pad. On each side of the pad, the synovial membrane forms a fringed margin (an alar fold), which projects into the articular cavity. In addition, the synovial membrane covering the lower part of the infrapatellar fat pad is raised into a sharp midline fold directed posteriorly (the infrapatellar synov

**[H] `medrag-anatomy_gray:1362`** — hal. 0, chunk 1362

> The distal end of the femur is characterized by two large condyles, which articulate with the proximal head of the tibia. The condyles are separated posteriorly by an intercondylar fossa and are joined anteriorly where they articulate with the patella. The surfaces of the condyles that articulate with the tibia are rounded posteriorly and become flatter inferiorly. On each condyle, a shallow obliq

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-cardiovascular-004  (F/cardiovascular)

**QUERY:** What is the Supreme intercostal artery?

**MUST-HAVE:** supremeintercostalartery

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:481, medrag-anatomy_gray:335, medrag-anatomy_gray:2462

**Teks kunci lama `medrag-anatomy_gray:481`:**

> Fig. 3.27 Intercostal muscles. Fig. 3.28 A. Subcostal muscles. B. Transversus thoracis muscles. Fig. 3.29 Arteries of the thoracic wall. Superior epigastric arteryInternal thoracic arteryAortaAnterior perforatingbranchesAnterior intercostal arteryCollateral branch of posteriorintercostal arterySupreme intercostal arteryPosterior intercostal arteryMusculophrenic arterySubclavian arteryCostocervical

**Teks kunci lama `medrag-anatomy_gray:335`:**

> The transversus thoracis muscles lie deep to the internal thoracic vessels and secure these vessels to the wall. Vessels that supply the thoracic wall consist mainly of posterior and anterior intercostal arteries, which pass around the wall between adjacent ribs in intercostal spaces (Fig. 3.29). These arteries originate from the aorta and internal thoracic arteries, which in turn arise from the s

**Teks kunci lama `medrag-anatomy_gray:2462`:**

> On the left, it arises from the first part of the subclavian artery, just medial to the anterior scalene muscle. On the right, it arises from the second part of the subclavian artery. On both sides, the costocervical trunk ascends and passes posteriorly over the dome of the pleural cavity and continues in a posterior direction behind the anterior scalene muscle. Eventually it divides into two bran

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:335`** — hal. 0, chunk 335

> The transversus thoracis muscles lie deep to the internal thoracic vessels and secure these vessels to the wall. Vessels that supply the thoracic wall consist mainly of posterior and anterior intercostal arteries, which pass around the wall between adjacent ribs in intercostal spaces (Fig. 3.29). These arteries originate from the aorta and internal thoracic arteries, which in turn arise from the s

**[B] `medrag-anatomy_gray:338`** — hal. 0, chunk 338

> Anterior intercostal arteries that supply the upper six intercostal spaces arise as lateral branches from the internal thoracic artery, whereas those supplying the lower spaces arise from the musculophrenic artery. In each intercostal space, the anterior intercostal arteries usually have two branches: One passes below the margin of the upper rib. The other passes above the margin of the lower rib 

**[C] `medrag-anatomy_gray:339`** — hal. 0, chunk 339

> In addition to anterior intercostal arteries and a number of other branches, the internal thoracic arteries give rise to perforating branches that pass directly forward between the costal cartilages to supply structures external to the thoracic wall. These vessels travel with the anterior cutaneous branches of the intercostal nerves. Venous drainage from the thoracic wall generally parallels the p

**[D] `medrag-anatomy_gray:336`** — hal. 0, chunk 336

> The remaining nine pairs of posterior intercostal arteries arise from the posterior surface of the thoracic aorta. Because the aorta is on the left side of the vertebral column, those posterior intercostal vessels passing to the right side of the thoracic wall cross the midline anterior to the bodies of the vertebrae and therefore are longer than the corresponding vessels on the left. In addition 

**[E] `medrag-anatomy_gray:337`** — hal. 0, chunk 337

> The anterior intercostal arteries originate directly or indirectly as lateral branches from the internal thoracic arteries (Fig. 3.29). Each internal thoracic artery arises as a major branch of the subclavian artery in the neck. It passes anteriorly over the cervical dome of the pleura and descends vertically through the superior thoracic aperture and along the deep aspect of the anterior thoracic

**[F] `medrag-anatomy_gray:436`** — hal. 0, chunk 436

> The left superior intercostal vein receives the second, third, and sometimes the fourth posterior intercostal veins, usually the left bronchial veins, and sometimes the left pericardiacophrenic vein. It passes over the left side of the aortic arch, lateral to the left vagus nerve and medial to the left phrenic nerve, before entering the left brachiocephalic vein (Fig. 3.89). Inferiorly, it may con

**[G] `medrag-anatomy_gray:327`** — hal. 0, chunk 327

> In addition, the sternal angle lies on a horizontal plane that passes through the intervertebral disc between vertebrae TIV and TV (see Fig. 3.10). This plane separates the superior mediastinum from the inferior mediastinum and marks the superior border of the pericardium. The plane also passes through the end of the ascending aorta and the beginning of the arch of the aorta, the end of the arch o

**[H] `medrag-anatomy_gray:2462`** — hal. 0, chunk 2462

> On the left, it arises from the first part of the subclavian artery, just medial to the anterior scalene muscle. On the right, it arises from the second part of the subclavian artery. On both sides, the costocervical trunk ascends and passes posteriorly over the dome of the pleural cavity and continues in a posterior direction behind the anterior scalene muscle. Eventually it divides into two bran

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-cardiovascular-008  (F/cardiovascular)

**QUERY:** What is the function of the Common iliac artery?

**MUST-HAVE:** commoniliacartery

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:1558, medrag-anatomy_gray:835, medrag-anatomy_gray:1098

**Teks kunci lama `medrag-anatomy_gray:1558`:**

> Fig. 6.34 Blood supply of the hip joint. Internal iliac arteryCommon iliac arteryExternal iliac arteryLateral circumflex femoral artery1st perforating arteryDeep artery of thighMedial circumflex femoral arteryFemoral arteryObturator arteryInferior gluteal arterySuperior gluteal artery Fig. 6.35 Gateways to the lower limb.

**Teks kunci lama `medrag-anatomy_gray:835`:**

> Fig. 4.161 Kidney transplant. A. This image demonstrates an MR angiogram of the bifurcation of the aorta. Attaching to the left external iliac artery is the donor artery for a kidney that has been transplanted into the left iliac fossa. B. Abdominal computed tomogram, in the axial plane, showing the transplanted kidney in the left iliac fossa. AAbdominal aortaCommon iliac arteryExternal iliacarter

**Teks kunci lama `medrag-anatomy_gray:1098`:**

> The internal iliac artery originates from the common iliac artery on each side, approximately at the level of the intervertebral disc between LV and SI, and lies anteromedial to the sacro-iliac joint (Fig. 5.64). The vessel courses inferiorly over the pelvic inlet and then divides into anterior and posterior trunks at the level of the superior border of the greater sciatic foramen. Branches from t

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:1103`** — hal. 0, chunk 1103

> The middle rectal artery courses medially to supply the rectum. The vessel anastomoses with the superior rectal artery, which originates from the inferior mesenteric artery in the abdomen, and the inferior rectal artery, which originates from the internal pudendal artery in the perineum. The obturator artery courses anteriorly along the pelvic wall and leaves the pelvic cavity via the obturator ca

**[B] `medrag-anatomy_gray:1099`** — hal. 0, chunk 1099

> Branches of the posterior trunk of the internal iliac artery are the iliolumbar artery, the lateral sacral artery, and the superior gluteal artery (Fig. 5.64). The iliolumbar artery ascends laterally back out of the pelvic inlet and divides into a lumbar branch and an iliac branch. The lumbar branch contributes to the supply of the posterior abdominal wall, psoas and quadratus lumborum muscles, an

**[C] `medrag-anatomy_gray:719`** — hal. 0, chunk 719

> Continuing distally along the main trunk of the superior mesenteric artery, the right colic artery is the second of the three branches from the right side of the main trunk of the superior mesenteric artery (Fig. 4.126). It is an inconsistent branch, and passes to the right in a retroperitoneal position to supply the ascending colon. Nearing the colon, it divides into a descending branch, which an

**[D] `medrag-anatomy_gray:1098`** — hal. 0, chunk 1098

> The internal iliac artery originates from the common iliac artery on each side, approximately at the level of the intervertebral disc between LV and SI, and lies anteromedial to the sacro-iliac joint (Fig. 5.64). The vessel courses inferiorly over the pelvic inlet and then divides into anterior and posterior trunks at the level of the superior border of the greater sciatic foramen. Branches from t

**[E] `medrag-anatomy_gray:1100`** — hal. 0, chunk 1100

> The superior gluteal artery is the largest branch of the internal iliac artery and is the terminal continuation of the posterior trunk. It courses posteriorly, usually passing between the lumbosacral trunk and anterior ramus of S1, to leave the pelvic cavity through the greater sciatic foramen above the piriformis muscle and enter the gluteal region of the lower limb. This vessel makes a substanti

**[F] `medrag-anatomy_gray:1558`** — hal. 0, chunk 1558

> Fig. 6.34 Blood supply of the hip joint. Internal iliac arteryCommon iliac arteryExternal iliac arteryLateral circumflex femoral artery1st perforating arteryDeep artery of thighMedial circumflex femoral arteryFemoral arteryObturator arteryInferior gluteal arterySuperior gluteal artery Fig. 6.35 Gateways to the lower limb.

**[G] `medrag-anatomy_gray:1097`** — hal. 0, chunk 1097

> The major artery of the pelvis and perineum is the internal iliac artery on each side (Fig. 5.64). In addition to providing a blood supply to most of the pelvic viscera, pelvic walls and floor, and structures in the perineum, including erectile tissues of the clitoris and the penis, this artery gives rise to branches that follow nerves into the gluteal region of the lower limb. Other vessels that 

**[H] `medrag-anatomy_gray:1107`** — hal. 0, chunk 1107

> The median sacral artery (Figs. 5.65A and 5.66) originates from the posterior surface of the aorta just superior to the aortic bifurcation at vertebral level LIV in the abdomen. It descends in the midline, crosses the pelvic inlet, and then courses along the anterior surface of the sacrum and coccyx. It gives rise to the last pair of lumbar arteries and to branches that anastomose with the iliolum

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-cardiovascular-012  (F/cardiovascular)

**QUERY:** What is the Superior vena cava?

**MUST-HAVE:** superiorvenacava

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:545, medrag-anatomy_gray:437, medrag-anatomy_gray:494

**Teks kunci lama `medrag-anatomy_gray:545`:**

> In the clinic Using the superior vena cava to access the inferior vena cava Because the superior and inferior venae cavae are oriented along the same vertical axis, a guidewire, catheter, or line can be passed from the superior vena cava through the right atrium and into the inferior vena cava. This is a common route of access for such procedures as: transjugular liver biopsy, transjugular intrahe

**Teks kunci lama `medrag-anatomy_gray:437`:**

> The lower half of the superior vena cava is within the pericardial sac and is therefore contained in the middle mediastinum. The superior vena cava receives the azygos vein immediately before entering the pericardial sac and may also receive pericardial and mediastinal veins. The superior vena cava can be easily visualized forming part of the right superolateral border of the mediastinum on a ches

**Teks kunci lama `medrag-anatomy_gray:494`:**

> Fig. 3.85 Major vessels within the middle mediastinum. A. Anterior view. B. Posterior view. Ascending aortaPulmonary trunkSuperiorvena cavaSuperior vena cavaInferior vena cavaOblique pericardial sinusRight pulmonaryarteryRight pulmonaryveinsRight atriumLeft pulmonaryveinsLeft pulmonaryarteryArch of aortaAB Fig. 3.86 Structures in the superior mediastinum. Right internal jugular veinRight common ca

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:393`** — hal. 0, chunk 393

> The superior vena cava enters the upper posterior portion of the right atrium, and the inferior vena cava and coronary sinus enter the lower posterior portion of the right atrium. From the right atrium, blood passes into the right ventricle through the right atrioventricular orifice. This opening faces forward and medially and is closed during ventricular contraction by the tricuspid valve. The in

**[B] `medrag-anatomy_gray:435`** — hal. 0, chunk 435

> The left brachiocephalic vein begins posterior to the medial end of the left clavicle. It crosses to the right, moving in a slightly inferior direction, and joins with the right brachiocephalic vein to form the superior vena cava posterior to the lower edge of the right first costal cartilage close to the right sternal border. Venous tributaries include the vertebral, first posterior intercostal, 

**[C] `medrag-anatomy_gray:436`** — hal. 0, chunk 436

> The left superior intercostal vein receives the second, third, and sometimes the fourth posterior intercostal veins, usually the left bronchial veins, and sometimes the left pericardiacophrenic vein. It passes over the left side of the aortic arch, lateral to the left vagus nerve and medial to the left phrenic nerve, before entering the left brachiocephalic vein (Fig. 3.89). Inferiorly, it may con

**[D] `medrag-anatomy_gray:545`** — hal. 0, chunk 545

> In the clinic Using the superior vena cava to access the inferior vena cava Because the superior and inferior venae cavae are oriented along the same vertical axis, a guidewire, catheter, or line can be passed from the superior vena cava through the right atrium and into the inferior vena cava. This is a common route of access for such procedures as: transjugular liver biopsy, transjugular intrahe

**[E] `medrag-anatomy_gray:437`** — hal. 0, chunk 437

> The lower half of the superior vena cava is within the pericardial sac and is therefore contained in the middle mediastinum. The superior vena cava receives the azygos vein immediately before entering the pericardial sac and may also receive pericardial and mediastinal veins. The superior vena cava can be easily visualized forming part of the right superolateral border of the mediastinum on a ches

**[F] `medrag-anatomy_gray:781`** — hal. 0, chunk 781

> During its course, the anterior surface of the inferior vena cava is crossed by the right common iliac artery, the root of the mesentery, the right testicular or ovarian artery, the inferior part of the duodenum, the head of the pancreas, the superior part of the duodenum, the bile duct, the portal vein, and the liver, which overlaps and on occasion completely surrounds the vena cava (Fig. 4.166).

**[G] `medrag-anatomy_gray:619`** — hal. 0, chunk 619

> Venous shunts from left to right All blood returning to the heart from regions of the body other than the lungs flows into the right atrium of the heart. The inferior vena cava is the major systemic vein in the abdomen and drains this region together with the pelvis, perineum, and both lower limbs (Fig. 4.18). The inferior vena cava lies to the right of the vertebral column and penetrates the cent

**[H] `medrag-anatomy_gray:430`** — hal. 0, chunk 430

> The inferior half of the superior vena cava is located within the pericardial sac (Fig. 3.85B). It passes through the fibrous pericardium at approximately the level of the second costal cartilage and enters the right atrium at the lower level of the third costal cartilage. The portion within the pericardial sac is covered with serous pericardium except for a small area on its posterior surface. Af

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-cardiovascular-015  (F/cardiovascular)

**QUERY:** What is the function of the Left testicular artery?

**MUST-HAVE:** lefttesticularartery

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:810

**Teks kunci lama `medrag-anatomy_gray:810`:**

> RectumPeritoneumPelvic inletBladderUterusShadow of ureterShadow of internal iliac vessels Fig. 4.12 Structures passing between the abdomen and thigh. Fig. 4.13 A series (A to H) showing the development of the gut and mesenteries. Fig. 4.14 Innervation of the anterior abdominal wall. Fig. 4.15 Inguinal region. A. Development. B. In men. C. In women. Inferior vena cavaRight testicular arteryLeft tes

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:414`** — hal. 0, chunk 414

> The anterior interventricular branch (left anterior descending artery—LAD) (Fig. 3.78A,C) continues around the left side of the pulmonary trunk and descends obliquely toward the apex of the heart in the anterior interventricular sulcus (Fig. 3.78A,C). During its course, one or two large diagonal branches may arise and descend diagonally across the anterior surface of the left ventricle. The circum

**[B] `medrag-anatomy_gray:778`** — hal. 0, chunk 778

> The paired visceral branches of the abdominal aorta (Fig. 4.164) include: the middle suprarenal arteries—small, lateral branches of the abdominal aorta arising just above the renal arteries that are part of the multiple vascular supply to the suprarenal gland; the renal arteries—lateral branches of the abdominal aorta that arise just inferior to the origin of the superior mesenteric artery between

**[C] `medrag-anatomy_gray:441`** — hal. 0, chunk 441

> The left subclavian artery is the major blood supply to the left upper limb. The ligamentum arteriosum is also in the superior mediastinum and is important in embryonic circulation, when it is a patent vessel (the ductus arteriosus). It connects the pulmonary trunk with the arch of the aorta and allows blood to bypass the lungs during development (Fig. 3.90). The vessel closes soon after birth and

**[D] `medrag-anatomy_gray:1760`** — hal. 0, chunk 1760

> The lateral thoracic artery arises from the anterior surface of the second part of the axillary artery posterior to the lateral (inferior) margin of the pectoralis minor (Fig. 7.50). It follows the margin of the muscle to the thoracic wall and supplies the medial and anterior walls of the axilla. In women, branches emerge from around the inferior margin of the pectoralis major muscle and contribut

**[E] `medrag-anatomy_gray:721`** — hal. 0, chunk 721

> The ileal branch passes to the left and ascends to supply the final part of the ileum before anastomosing with the superior mesenteric artery. The inferior mesenteric artery is the anterior branch of the abdominal aorta that supplies the hindgut. It is the smallest of the three anterior branches of the abdominal aorta and arises anterior to the body of vertebra LIII. Initially, the inferior mesent

**[F] `medrag-anatomy_gray:769`** — hal. 0, chunk 769

> A single large renal artery, a lateral branch of the abdominal aorta, supplies each kidney. These vessels usually arise just inferior to the origin of the superior mesenteric artery between vertebrae LI and LII (Fig. 4.154). The left renal artery usually arises a little higher than the right, and the right renal artery is longer and passes posterior to the inferior vena cava. As each renal artery 

**[G] `medrag-anatomy_gray:722`** — hal. 0, chunk 722

> The left colic artery is the first branch of the inferior mesenteric artery (Fig. 4.128). It ascends retroperitoneally, dividing into ascending and descending branches: The ascending branch passes anteriorly to the left kidney, then enters the transverse mesocolon, and passes superiorly to supply the upper part of the descending colon and the distal part of the transverse colon; it anastomoses wit

**[H] `medrag-anatomy_gray:618`** — hal. 0, chunk 618

> Three large unpaired arteries branch from the anterior surface of the abdominal aorta to supply the abdominal part of the gastrointestinal tract and all of the structures (liver, pancreas, and gallbladder) to which this part of the gut gives rise during development (Fig. 4.17). These arteries pass through derivatives of the dorsal and ventral mesenteries to reach the target viscera. These vessels 

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-fasciae-004  (F/fasciae)

**QUERY:** What is the Palmar aponeurosis?

**MUST-HAVE:** palmaraponeurosis

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:1909, medrag-anatomy_gray:1880, medrag-anatomy_gray:1957

**Teks kunci lama `medrag-anatomy_gray:1909`:**

> The palmar digital nerves cross the palm deep to the palmar aponeurosis and the superficial palmar arch and enter the digits. They innervate skin on the palmar surfaces of the lateral three and one-half digits and cutaneous regions over the dorsal aspects of the distal phalanges (nail beds) of the same digits. In addition to skin, the digital nerves supply the lateral two lumbrical muscles. Superf

**Teks kunci lama `medrag-anatomy_gray:1880`:**

> Transverse fibers interconnect the more longitudinally arranged bundles that continue into the digits. Vessels, nerves, and long flexor tendons lie deep to the palmar aponeurosis in the palm. The palmaris brevis, a small intrinsic muscle of the hand, is a quadrangular-shaped subcutaneous muscle that overlies the hypothenar muscles, ulnar artery, and superficial branch of the ulnar nerve at the med

**Teks kunci lama `medrag-anatomy_gray:1957`:**

> Fig. 7.84 Abduction of the distal end of the ulna by the anconeus during pronation. Abduction ofulna by anconeusduring pronationAxis of movementwith abduction of ulnaAnconeus Fig. 7.85 Superficial layer of forearm muscles. A. Superficial muscles (flexor retinaculum not shown). B. Flexor carpi ulnaris muscle. Median nerveFlexor carpi radialisPalmaris longusFlexor carpi ulnaris Palmar aponeurosisPis

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:1829`** — hal. 0, chunk 1829

> In addition to its role as an accessory flexor of the wrist joint, the palmaris longus muscle also opposes shearing forces on the skin of the palm during gripping (Table 7.10). The flexor carpi radialis muscle is lateral to the palmaris longus and has a large and prominent tendon in the distal half of the forearm (Fig. 7.85A and Table 7.10). Unlike the tendon of the flexor carpi ulnaris, which for

**[B] `medrag-anatomy_gray:1880`** — hal. 0, chunk 1880

> Transverse fibers interconnect the more longitudinally arranged bundles that continue into the digits. Vessels, nerves, and long flexor tendons lie deep to the palmar aponeurosis in the palm. The palmaris brevis, a small intrinsic muscle of the hand, is a quadrangular-shaped subcutaneous muscle that overlies the hypothenar muscles, ulnar artery, and superficial branch of the ulnar nerve at the med

**[C] `medrag-anatomy_gray:1879`** — hal. 0, chunk 1879

> The tendons of the extensor carpi ulnaris and extensor digiti minimi have separate compartments and sheaths on the medial side of the wrist. The tendons of the abductor pollicis longus and extensor pollicis brevis muscles, the extensor carpi radialis longus and extensor carpi radialis brevis muscles, and the extensor pollicis longus muscle pass through three compartments on the lateral surface of 

**[D] `medrag-anatomy_gray:1925`** — hal. 0, chunk 1925

> Visualizing the positions of the superficial and deep palmar arches The positions of the superficial and deep palmar arches in the hand can be visualized using bony landmarks, muscle eminences, and skin creases (Fig. 7.126). The superficial palmar arch begins as a continuation of the ulnar artery, which lies lateral to the pisiform bone at the wrist. The arch curves laterally across the palm anter

**[E] `medrag-anatomy_gray:1890`** — hal. 0, chunk 1890

> The radial artery passes between the two heads of the first dorsal interosseous muscle as it passes from the anatomical snuffbox on the posterolateral side of the wrist into the deep aspect of the palm. The three (or four) palmar interossei are anterior to the dorsal interossei, and are unipennate muscles originating from the metacarpals of the digits with which each is associated (Fig. 7.105). Th

**[F] `medrag-anatomy_gray:1926`** — hal. 0, chunk 1926

> The deep palmar arch originates on the lateral side of the palm deep to the long flexor tendons and between the proximal ends of metacarpals I and II. It arches medially across the palm and terminates by joining the deep branch of the ulnar artery, which passes through the base of the hypothenar muscles and between the pisiform and hook of the hamate. The deep palmar arch is more proximal in the h

**[G] `medrag-anatomy_gray:2636`** — hal. 0, chunk 2636

> The tendon loops 90° medially around the pterygoid hamulus, penetrating the origin of the buccinator muscle as it does, and expands like a fan to form the fibrous horizontal part of the muscle. This fibrous part is continuous across the midline with its partner on the other side to form the palatine aponeurosis. The palatine aponeurosis is attached anteriorly to the margin of the hard palate, but 

**[H] `medrag-anatomy_gray:1647`** — hal. 0, chunk 1647

> In the clinic The plantar aponeurosis is a flat band of connective tissue that supports the arch of the sole of the foot. It runs from the calcaneal tuberosity to the base of the toes. Overuse and increased strain on the plantar aponeurosis, such as excessive running and standing, and increased body weight, can lead to micro-tears and degeneration within the aponeurosis at the heel with disorganiz

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-joints-009  (F/joints)

**QUERY:** Where is the Transverse humeral ligament located?

**MUST-HAVE:** transversehumeralligament

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:1935, medrag-anatomy_gray:1945, medrag-anatomy_gray:1720

**Teks kunci lama `medrag-anatomy_gray:1935`:**

> Fig. 7.23 Sternoclavicular joint. A. Bones and ligaments. B. Volume-rendered reconstruction using multidetector computed tomography. CostoclavicularligamentInterclavicularligamentClavicular notchAnteriorsternoclavicularligamentManubrium ofsternumSternal angleArticular disc(capsule and ligamentsremoved anteriorlyto expose joint)Attachment sitefor rib IIFirst costalcartilageRib IVertebral body of TI

**Teks kunci lama `medrag-anatomy_gray:1945`:**

> Fig. 7.48 Contents of the axilla: muscles. Long head of biceps brachiiShort head of biceps brachiiTendon of biceps brachiiCoracobrachialisBicipital aponeurosisTransverse humeral ligament Fig. 7.49 Contents of the axilla: the axillary artery. Lower border of teres majorPectoralis minorLateral margin of rib ISubclaviusSubclavian artery1st part2nd part3rd partBrachial arteryAxillary artery Fig. 7.50 

**Teks kunci lama `medrag-anatomy_gray:1720`:**

> The fibrous membrane of the joint capsule is thickened: anterosuperiorly in three locations to form superior, middle, and inferior glenohumeral ligaments, which pass from the superomedial margin of the glenoid cavity to the lesser tubercle and inferiorly related anatomical neck of the humerus (Fig. 7.27); superiorly between the base of the coracoid process and the greater tubercle of the humerus (

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:1719`** — hal. 0, chunk 1719

> On the humerus, the medial attachment occurs more inferiorly than the neck and extends onto the shaft. In this region, the fibrous membrane is also loose or folded in the anatomical position. This redundant area of the fibrous membrane accommodates abduction of the arm. Openings in the fibrous membrane provide continuity of the articular cavity with bursae that occur between the joint capsule and 

**[B] `medrag-anatomy_gray:1710`** — hal. 0, chunk 1710

> In approximately the same position, but on the medial surface of the bone, there is a thin vertical roughening for attachment of the coracobrachialis muscle. One of the most important features of the proximal end of the humerus is the surgical neck (Fig. 7.22). This region is oriented in the horizontal plane between the expanded proximal part of the humerus (head, anatomical neck, and tubercles) a

**[C] `medrag-anatomy_gray:1720`** — hal. 0, chunk 1720

> The fibrous membrane of the joint capsule is thickened: anterosuperiorly in three locations to form superior, middle, and inferior glenohumeral ligaments, which pass from the superomedial margin of the glenoid cavity to the lesser tubercle and inferiorly related anatomical neck of the humerus (Fig. 7.27); superiorly between the base of the coracoid process and the greater tubercle of the humerus (

**[D] `medrag-anatomy_gray:1937`** — hal. 0, chunk 1937

> Fig. 7.28 Lateral view of right glenohumeral joint and surrounding muscles with proximal end of humerus removed. SupraspinatusInfraspinatusTeres minorTeres majorSynovial membraneSubtendinous bursaof subscapularisLong head of biceps brachii tendonLong head of tricepsbrachiiShort head of biceps brachiiand coracobrachialisLatissimus dorsiPectoralis majorGlenoid labrum Fibrous membraneSubscapularisDel

**[E] `medrag-anatomy_gray:1762`** — hal. 0, chunk 1762

> This anterior circumflex humeral artery supplies branches to surrounding tissues, which include the glenohumeral joint and the head of the humerus. The posterior circumflex humeral artery originates from the lateral surface of the third part of the axillary artery immediately posterior to the origin of the anterior circumflex humeral artery (Fig. 7.50). With the axillary nerve, it leaves the axill

**[F] `medrag-anatomy_gray:1709`** — hal. 0, chunk 1709

> The lateral lip of the intertubercular sulcus is continuous inferiorly with a large V-shaped deltoid tuberosity on the lateral surface of the humerus midway along its length (Fig. 7.22), which is where the deltoid muscle inserts onto the humerus. In approximately the same position, but on the medial surface of the bone, there is a thin vertical roughening for attachment of the coracobrachialis mus

**[G] `medrag-anatomy_gray:1939`** — hal. 0, chunk 1939

> DeltoidHead of humerusNeedleSubacromial-subdeltoid bursa Fig. 7.35 Lateral view of trapezius and deltoid muscles. AcromionSpine of thescapulaTrapeziusDeltoidDeltoid tuberosity of humerusClavicle Fig. 7.36 Attachments and neurovascular supply of the trapezius and deltoid muscles. AcromionSpine of scapulaTrapeziusDeltoidDeltoid tuberosity of humerusRhomboid minorRhomboid majorClavicleSuperior nuchal

**[H] `medrag-anatomy_gray:1786`** — hal. 0, chunk 1786

> Shaft and distal end of the humerus In cross section, the shaft of the humerus is somewhat triangular with: anterior, lateral, and medial borders, and anterolateral, anteromedial, and posterior surfaces (Fig. 7.60). The posterior surface of the humerus is marked on its superior aspect by a linear roughening for the attachment of the lateral head of the triceps brachii muscle, beginning just inferi

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-joints-016  (F/joints)

**QUERY:** What is the function of the Transverse acetabular ligament?

**MUST-HAVE:** transverseacetabularligament

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:1557, medrag-anatomy_gray:1307, medrag-anatomy_gray:1308

**Teks kunci lama `medrag-anatomy_gray:1557`:**

> Fig. 6.31 Hip joint. A. Transverse acetabular ligament. B. Ligament of the head of the femur. The head of the femur has been laterally rotated out of the acetabulum to show the ligament. ABAcetabular labrum Lunate surfaceTransverseacetabular ligamentAcetabularforamenObturator foramenAcetabular fossaArtery of ligament of headSynovial sleeve around ligamentLigament of head of femurIschial tuberosity

**Teks kunci lama `medrag-anatomy_gray:1307`:**

> The ligament of the head of the femur is a flat band of delicate connective tissue that attaches at one end to the fovea on the head of the femur and at the other end to the acetabular fossa, transverse acetabular ligament, and margins of the acetabular notch (Fig. 6.31B). It carries a small branch of the obturator artery, which contributes to the blood supply of the head of the femur. The synovia

**Teks kunci lama `medrag-anatomy_gray:1308`:**

> The fibrous membrane that encloses the hip joint is strong and generally thick. Medially, it is attached to the margin of the acetabulum, the transverse acetabular ligament, and the adjacent margin of the obturator foramen (Fig. 6.33A). Laterally, it is attached to the intertrochanteric line on the anterior aspect of the femur and to the neck of the femur just proximal to the intertrochanteric cre

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:1309`** — hal. 0, chunk 1309

> Three ligaments reinforce the external surface of the fibrous membrane and stabilize the joint: the iliofemoral, pubofemoral, and ischiofemoral ligaments. The iliofemoral ligament is anterior to the hip joint and is triangular shaped (Fig. 6.33B). Its apex is attached to the ilium between the anterior inferior iliac spine and the margin of the acetabulum and its base is attached along the intertro

**[B] `medrag-anatomy_gray:1557`** — hal. 0, chunk 1557

> Fig. 6.31 Hip joint. A. Transverse acetabular ligament. B. Ligament of the head of the femur. The head of the femur has been laterally rotated out of the acetabulum to show the ligament. ABAcetabular labrum Lunate surfaceTransverseacetabular ligamentAcetabularforamenObturator foramenAcetabular fossaArtery of ligament of headSynovial sleeve around ligamentLigament of head of femurIschial tuberosity

**[C] `medrag-anatomy_gray:1308`** — hal. 0, chunk 1308

> The fibrous membrane that encloses the hip joint is strong and generally thick. Medially, it is attached to the margin of the acetabulum, the transverse acetabular ligament, and the adjacent margin of the obturator foramen (Fig. 6.33A). Laterally, it is attached to the intertrochanteric line on the anterior aspect of the femur and to the neck of the femur just proximal to the intertrochanteric cre

**[D] `medrag-anatomy_gray:1306`** — hal. 0, chunk 1306

> The articular surfaces of the hip joint are: the spherical head of the femur, and the lunate surface of the acetabulum of the pelvic bone. The acetabulum almost entirely encompasses the hemispherical head of the femur and contributes substantially to joint stability. The nonarticular acetabular fossa contains loose connective tissue. The lunate surface is covered by hyaline cartilage and is broade

**[E] `medrag-anatomy_gray:1310`** — hal. 0, chunk 1310

> The ischiofemoral ligament reinforces the posterior aspect of the fibrous membrane (Fig. 6.33C). It is attached medially to the ischium, just posteroinferior to the acetabulum, and laterally to the greater trochanter deep to the iliofemoral ligament. The fibers of all three ligaments are oriented in a spiral fashion around the hip joint so that they become taut when the joint is extended. This sta

**[F] `medrag-anatomy_gray:1028`** — hal. 0, chunk 1028

> These ligaments stabilize the sacrum on the pelvic bones by resisting the upward tilting of the inferior aspect of the sacrum (Fig. 5.29B). They also convert the greater and lesser sciatic notches of the pelvic bone into foramina (Fig. 5.29A,B). The greater sciatic foramen lies superior to the sacrospinous ligament and the ischial spine. The lesser sciatic foramen lies inferior to the ischial spin

**[G] `medrag-anatomy_gray:1307`** — hal. 0, chunk 1307

> The ligament of the head of the femur is a flat band of delicate connective tissue that attaches at one end to the fovea on the head of the femur and at the other end to the acetabular fossa, transverse acetabular ligament, and margins of the acetabular notch (Fig. 6.31B). It carries a small branch of the obturator artery, which contributes to the blood supply of the head of the femur. The synovia

**[H] `medrag-anatomy_gray:1298`** — hal. 0, chunk 1298

> The large cup-shaped acetabulum for articulation with the head of the femur is on the lateral surface of the pelvic bone in the region where the ilium, pubis, and ischium fuse (Fig. 6.24). The margin of the acetabulum is marked inferiorly by a prominent notch (acetabular notch). The wall of the acetabulum consists of nonarticular and articular parts: The nonarticular part is rough and forms a shal

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-lymphoid-011  (F/lymphoid)

**QUERY:** What is the function of the Spleen?

**MUST-HAVE:** spleen

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:707, medrag-anatomy_gray:828, medrag-anatomy_gray:905

**Teks kunci lama `medrag-anatomy_gray:707`:**

> Both these ligaments are parts of the greater omentum. The spleen is surrounded by visceral peritoneum except in the area of the hilum on the medial surface of the spleen (Fig. 4.114). The splenic hilum is the entry point for the splenic vessels, and occasionally the tail of the pancreas reaches this area. The arterial supply to the spleen (Fig. 4.115) is the splenic artery from the celiac trunk. 

**Teks kunci lama `medrag-anatomy_gray:828`:**

> Fig. 4.112 Spleen. Fig. 4.113 Splenic ligaments and related vasculature. Fig. 4.114 Surfaces and hilum of the spleen. Fig. 4.115 Arterial supply to the spleen. Fig. 4.116 Division of the liver into segments based upon the distributions of the bile ducts and hepatic vessels (Couinaud’s segments). Fig. 4.117 Gallbladder containing multiple stones. Ultrasound scan. Fig. 4.118 Magnetic resonance chola

**Teks kunci lama `medrag-anatomy_gray:905`:**

> The spleen is an organ of the reticuloendothelial system involved in hematopoiesis and immunological surveillance. Diseases that affect the reticuloendothelial system (e.g., leukemia or lymphoma) may produce generalized lymphadenopathy and enlargement of the spleen (splenomegaly) (Fig. 4.120). The spleen often enlarges when performing its normal physiological functions, such as when clearing micro

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:706`** — hal. 0, chunk 706

> The omental foramen is posterior to these structures at this point. The bile duct continues to descend, passing posteriorly to the superior part of the duodenum before joining with the pancreatic duct to enter the descending part of the duodenum at the major duodenal papilla (Fig. 4.111). The spleen develops as part of the vascular system in the part of the dorsal mesentery that suspends the devel

**[B] `medrag-anatomy_gray:905`** — hal. 0, chunk 905

> The spleen is an organ of the reticuloendothelial system involved in hematopoiesis and immunological surveillance. Diseases that affect the reticuloendothelial system (e.g., leukemia or lymphoma) may produce generalized lymphadenopathy and enlargement of the spleen (splenomegaly) (Fig. 4.120). The spleen often enlarges when performing its normal physiological functions, such as when clearing micro

**[C] `medrag-anatomy_gray:726`** — hal. 0, chunk 726

> The splenic vein forms from numerous smaller vessels leaving the hilum of the spleen (Fig. 4.132). It passes to the right, passing through the splenorenal ligament with the splenic artery and the tail of the pancreas. Continuing to the right, the large, straight splenic vein is in contact with the body of the pancreas as it crosses the posterior abdominal wall. Posterior to the neck of the pancrea

**[D] `medrag-anatomy_gray:707`** — hal. 0, chunk 707

> Both these ligaments are parts of the greater omentum. The spleen is surrounded by visceral peritoneum except in the area of the hilum on the medial surface of the spleen (Fig. 4.114). The splenic hilum is the entry point for the splenic vessels, and occasionally the tail of the pancreas reaches this area. The arterial supply to the spleen (Fig. 4.115) is the splenic artery from the celiac trunk. 

**[E] `medrag-anatomy_gray:724`** — hal. 0, chunk 724

> Venous drainage of the spleen, pancreas, gallbladder, and abdominal part of the gastrointestinal tract, except for the inferior part of the rectum, is through the portal system of veins, which deliver blood from these structures to the liver. Once blood passes through the hepatic sinusoids, it passes through progressively larger veins until it enters the hepatic veins, which return the venous bloo

**[F] `medrag-anatomy_gray:828`** — hal. 0, chunk 828

> Fig. 4.112 Spleen. Fig. 4.113 Splenic ligaments and related vasculature. Fig. 4.114 Surfaces and hilum of the spleen. Fig. 4.115 Arterial supply to the spleen. Fig. 4.116 Division of the liver into segments based upon the distributions of the bile ducts and hepatic vessels (Couinaud’s segments). Fig. 4.117 Gallbladder containing multiple stones. Ultrasound scan. Fig. 4.118 Magnetic resonance chola

**[G] `medrag-anatomy_gray:620`** — hal. 0, chunk 620

> Other vessels crossing the midline include the left lumbar veins, which drain the back and posterior abdominal wall on the left side. All venous drainage from the through the liver Blood from abdominal parts of the gastrointestinal system and the spleen passes through a second vascular bed, in the liver, before ultimately returning to the heart (Fig. 4.19). Venous blood from the digestive tract, p

**[H] `medrag-anatomy_gray:904`** — hal. 0, chunk 904

> In the clinic From a clinical point of view, there are two main categories of spleen disorders: rupture and enlargement. This tends to occur when there is localized trauma to the left upper quadrant. It may be associated with left lower rib fractures. Because the spleen has such an extremely thin capsule, it is susceptible to injury even when there is no damage to surrounding structures, and becau

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-muscular-006  (F/muscular)

**QUERY:** What is the function of the Tibialis posterior muscle?

**MUST-HAVE:** tibialisposteriormuscle

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:1432, medrag-anatomy_gray:1445, medrag-anatomy_gray:1512

**Teks kunci lama `medrag-anatomy_gray:1432`:**

> The posterior surface of the box-like distal end of the tibia is marked by a vertical groove, which continues inferiorly and medially onto the posterior surface of the medial malleolus. The groove is for the tendon of the tibialis posterior muscle. The lateral surface of the distal end of the tibia is occupied by a deep triangular notch (the fibular notch), to which the distal head of the fibula i

**Teks kunci lama `medrag-anatomy_gray:1445`:**

> The flexor digitorum longus muscle originates on the medial side of the posterior compartment of the leg and inserts into the lateral four digits of the foot (Fig. 6.88). It arises mainly from the medial side of the posterior surface of the tibia inferior to the soleal line. The flexor digitorum longus descends in the leg and forms a tendon, which crosses posterior to the tendon of the tibialis po

**Teks kunci lama `medrag-anatomy_gray:1512`:**

> The medial head originates from the tendon of the tibialis posterior muscle as it passes into the sole of the foot. The medial and lateral heads unite and give rise to a muscle belly, which itself is separated into medial and lateral parts adjacent to the plantar surface of metatarsal I. Each part of the muscle gives rise to a tendon that inserts on either the lateral or medial side of the base of

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:1456`** — hal. 0, chunk 1456

> The fibularis longus everts and plantarflexes the foot. In addition, the fibularis longus, tibialis anterior, and tibialis posterior muscles, which all insert on the undersurfaces of bones on the medial side of the foot, together act as a stirrup to support the arches of the foot. The fibularis longus supports mainly the lateral and transverse arches. The fibularis longus is innervated by the supe

**[B] `medrag-anatomy_gray:1463`** — hal. 0, chunk 1463

> The extensor digitorum longus muscle is the most posterior and lateral of the muscles in the anterior compartment of the leg (Fig. 6.93). It originates mainly from the upper one-half of the medial surface of the fibula lateral to and above the origin of the extensor hallucis longus muscle, and extends superiorly onto the lateral condyle of the tibia. Like the tibialis anterior muscle, it also orig

**[C] `medrag-anatomy_gray:1446`** — hal. 0, chunk 1446

> The flexor digitorum longus flexes the lateral four toes. It is involved with gripping the ground during walking and propelling the body forward off the toes at the end of the stance phase of gait. It is innervated by the tibial nerve. The tibialis posterior muscle originates from the interosseous membrane and the adjacent posterior surfaces of the tibia and fibula (Fig. 6.88). It lies between and

**[D] `medrag-anatomy_gray:1441`** — hal. 0, chunk 1441

> On the tibia, the soleus originates from the soleal line and adjacent medial border. The ligament, which spans the distance between the attachments to the tibia and fibula, arches over the popliteal vessels and tibial nerve as they pass from the popliteal fossa into the deep region of the posterior compartment of the leg. In the lower leg, the soleus muscle narrows to join the calcaneal tendon tha

**[E] `medrag-anatomy_gray:1437`** — hal. 0, chunk 1437

> Posterior compartment of leg Muscles in the posterior (flexor) compartment of the leg are organized into two groups, superficial and deep, separated by a layer of deep fascia. Generally, the muscles mainly plantarflex and invert the foot and flex the toes. All are innervated by the tibial nerve. The superficial group of muscles in the posterior compartment of the leg comprises three muscles—the ga

**[F] `medrag-anatomy_gray:1461`** — hal. 0, chunk 1461

> The muscle fibers of the tibialis anterior converge in the lower one-third of the leg to form a tendon, which descends into the medial side of the foot, where it attaches to the medial and inferior surfaces of one of the tarsal bones (medial cuneiform) and adjacent parts of metatarsal I associated with the great toe. The tibialis anterior dorsiflexes the foot at the ankle joint and inverts the foo

**[G] `medrag-anatomy_gray:1447`** — hal. 0, chunk 1447

> Near the ankle, the tendon of the tibialis posterior is crossed superficially by the tendon of the flexor digitorum longus muscle and lies medial to this tendon in the groove on the posterior surface of the medial malleolus. The tendon curves forward under the medial malleolus and enters the medial side of the foot. It wraps around the medial margin of the foot to attach to the plantar surfaces of

**[H] `medrag-anatomy_gray:1430`** — hal. 0, chunk 1430

> Muscles in the anterior compartment of the leg dorsiflex the ankle, extend the toes, and invert the foot. Muscles in the posterior compartment plantarflex the ankle, flex the toes, and invert the foot. Muscles in the lateral compartment evert the foot. Major nerves and vessels supply or pass through each compartment. Shaft and distal end of tibia The shaft of the tibia is triangular in cross secti

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-muscular-009  (F/muscular)

**QUERY:** What is the Splenius capitis muscle?

**MUST-HAVE:** spleniuscapitismuscle

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:2729

**Teks kunci lama `medrag-anatomy_gray:2729`:**

> BLeft lobe of thyroid glandParathyroid gland Fig. 8.181 Surgical view of left lobe of enlarged thyroid (goiter) retracted to show close association with recurrent laryngeal nerve. Left lobe of thyroid glandLeft recurrent laryngeal nerve Fig. 8.182 Ectopic parathyroid adenoma in superior mediastinum. Noncontrast hybrid single photon emission computed tomography/computed tomography (SPECT/CT). A. Tr

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:164`** — hal. 0, chunk 164

> The supraspinous ligament connects and passes along the tips of the vertebral spinous processes from vertebra CVII to the sacrum (Fig. 2.37). From vertebra CVII to the skull, the ligament becomes structurally distinct from more caudal parts of the ligament and is called the ligamentum nuchae. The ligamentum nuchae is a triangular, sheet-like structure in the median sagittal plane: The base of the 

**[B] `medrag-anatomy_gray:223`** — hal. 0, chunk 223

> Fig. 2.51 Deep group of back muscles—transversospinales and segmental muscles. Spinous process of CVIIObliquus capitis inferiorObliquus capitis superiorRectus capitis posterior minorRectus capitis posterior majorSemispinalis thoracisIntertransversariusErector spinaeRotatores thoracis(short, long)Levatores costarum(short, long)Semispinalis capitisMultifidus Fig. 2.52 Deep group of back muscles—subo

**[C] `medrag-anatomy_gray:183`** — hal. 0, chunk 183

> The second group of segmental muscles are the true segmental muscles of the back—the interspinales, which pass between adjacent spinous processes, and the intertransversarii, which pass between adjacent transverse processes. These postural muscles stabilize adjoining vertebrae during movements of the vertebral column to allow more effective action of the large muscle groups. A small group of deep 

**[D] `medrag-anatomy_gray:185`** — hal. 0, chunk 185

> The obliquus capitis inferior muscle forms the inferior border. The contents of the suboccipital triangle include: posterior ramus of CI, vertebral artery, and veins The spinal cord extends from the foramen magnum to approximately the level of the disc between vertebrae LI and LII in adults, although it can end as high as vertebra TXII or as low as the disc between vertebrae LII and LIII (Fig. 2.5

**[E] `medrag-anatomy_gray:179`** — hal. 0, chunk 179

> The muscles in the erector spinae group are the primary extensors of the vertebral column and head. Acting bilaterally, they straighten the back, returning it to the upright position from a flexed position, and pull the head posteriorly. They also participate in controlling vertebral column flexion by contracting and relaxing in a coordinated fashion. Acting unilaterally, they bend the vertebral c

**[F] `medrag-anatomy_gray:176`** — hal. 0, chunk 176

> The two spinotransversales muscles run from the spinous processes and ligamentum nuchae upward and laterally (Fig. 2.49 and Table 2.3): The splenius capitis is a broad muscle attached to the occipital bone and mastoid process of the temporal bone. The splenius cervicis is a narrow muscle attached to the transverse processes of the upper cervical vertebrae. Together the spinotransversales muscles d

**[G] `medrag-anatomy_gray:177`** — hal. 0, chunk 177

> Together the spinotransversales muscles draw the head backward, extending the neck. Individually, each muscle rotates the head to one side—the same side as the contracting muscle. The erector spinae is the largest group of intrinsic back muscles. The muscles lie posterolaterally to the vertebral column between the spinous processes medially and the angles of the ribs laterally. They are covered in

**[H] `medrag-anatomy_gray:182`** — hal. 0, chunk 182

> One muscle in the transversospinales group, the semispinalis capitis, has a unique action because it attaches to the skull. Contracting bilaterally, this muscle pulls the head posteriorly, whereas unilateral contraction pulls the head posteriorly and turns it, causing the chin to move superiorly and turn toward the side of the contracting muscle. These actions are similar to those of the upper ere

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-muscular-013  (F/muscular)

**QUERY:** What is the Superior gemellus muscle?

**MUST-HAVE:** superiorgemellusmuscle

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:1089

**Teks kunci lama `medrag-anatomy_gray:1089`:**

> The inferior gluteal nerve, formed by branches from the dorsal divisions of L5 to S2, leaves the pelvic cavity through the greater sciatic foramen inferior to the piriformis muscle and supplies the gluteus maximus, the largest muscle in the gluteal region. Both superior and inferior gluteal nerves are accompanied by corresponding arteries. The nerve to the obturator internus and the associated sup

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:1301`** — hal. 0, chunk 1301

> On the medial side of the superior aspect of the greater trochanter and just above the trochanteric fossa is a small impression for attachment of the obturator internus and its associated gemelli muscles, and immediately above and behind this feature is an impression on the margin of the trochanter for attachment of the piriformis muscle. The lesser trochanter is smaller than the greater trochante

**[B] `medrag-anatomy_gray:1323`** — hal. 0, chunk 1323

> The nerve to the quadratus femoris supplies the gemellus inferior and quadratus femoris muscles. Posterior cutaneous nerve of thigh The posterior cutaneous nerve of the thigh is formed by contributions from S1 to S3 and leaves the pelvic cavity through the greater sciatic foramen inferior to the piriformis muscle (Fig. 6.36 and Table 6.1). It passes vertically through the gluteal region deep to th

**[C] `medrag-anatomy_gray:174`** — hal. 0, chunk 174

> Superiorly, it passes anteriorly to the serratus posterior muscle and is continuous with deep fascia in the neck. In the thoracic region, it covers the deep muscles and separates them from the muscles in the superficial and intermediate groups. Medially, it attaches to the spinous processes of the thoracic vertebrae and, laterally, to the angles of the ribs. The medial attachments of the latissimu

**[D] `medrag-anatomy_gray:2231`** — hal. 0, chunk 2231

> Levator palpebrae superioris raises the upper eyelid (Table 8.8). It is the most superior muscle in the orbit, originating from the roof, just anterior to the optic canal on the inferior surface of the lesser wing of the sphenoid (Fig. 8.95B). Its primary point of insertion is into the anterior surface of the superior tarsus, but a few fibers also attach to the skin of the upper eyelid and the sup

**[E] `medrag-anatomy_gray:2411`** — hal. 0, chunk 2411

> The mylohyoid muscle is superior to the anterior belly of the digastric and, with its partner from the opposite side, forms the floor of the mouth (Fig. 8.167). It originates from the mylohyoid line on the medial surface of the body of the mandible and inserts into the hyoid bone and also blends with the mylohyoid muscle from the opposite side. This mylohyoid muscle supports and elevates the floor

**[F] `medrag-anatomy_gray:1708`** — hal. 0, chunk 1708

> The superior facet is for attachment of the supraspinatus muscle. The middle facet is for attachment of the infraspinatus. The inferior facet is for attachment of the teres minor. The lesser tubercle is anterior in position and its surface is marked by a large smooth impression for attachment of the subscapularis muscle. A deep intertubercular sulcus (bicipital groove) separates the lesser and gre

**[G] `medrag-anatomy_gray:1342`** — hal. 0, chunk 1342

> The base of the gemellus inferior originates from the upper gluteal and pelvic surfaces of the ischial tuberosity. Fibers of the gemellus muscles attach along the length of the obturator internus tendon, and the apices of the two muscles insert with the tendon of the obturator internus on the greater trochanter of the femur. The gemellus superior is innervated by the nerve to the obturator internu

**[H] `medrag-anatomy_gray:1341`** — hal. 0, chunk 1341

> The muscle fibers of the obturator internus converge to form a tendon, which bends 90° around the ischium between the ischial spine and ischial tuberosity and passes through the lesser sciatic foramen to enter the gluteal region. The tendon then passes posteroinferiorly to the hip joint and attaches to the medial surface of the superior margin of the greater trochanter of the femur just inferior t

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-muscular-016  (F/muscular)

**QUERY:** Where is the Superior rectus muscle located?

**MUST-HAVE:** superiorrectusmuscle

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:2234, medrag-anatomy_gray:2237, medrag-anatomy_gray:2254

**Teks kunci lama `medrag-anatomy_gray:2234`:**

> The superior branch of the oculomotor nerve [III] innervates the superior rectus, and the inferior branch of the oculomotor nerve [III] innervates the inferior rectus. To isolate the function of and to test the superior and inferior rectus muscles, a patient is asked to track a physician’s finger laterally and then either upward or downward (Fig. 8.97B). The first movement brings the axis of the e

**Teks kunci lama `medrag-anatomy_gray:2237`:**

> The tendon of the superior oblique passes through the trochlea and turns laterally to cross the eyeball in a posterolateral direction. It continues deep to the superior rectus muscle and inserts into the outer posterior quadrant of the eyeball. Contraction of the superior oblique therefore directs the pupil down and out (Fig. 8.97A). The trochlear nerve [IV] innervates the superior oblique along i

**Teks kunci lama `medrag-anatomy_gray:2254`:**

> The nasociliary nerve is intermediate in size between the frontal and lacrimal nerves and is usually the first branch from the ophthalmic nerve (Fig. 8.104). It is most deeply placed in the orbit, entering the area within the common tendinous ring between the superior and inferior branches of the oculomotor nerve [III] (see Fig. 8.101). Once in the orbit, the nasociliary nerve crosses the superior

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:2236`** — hal. 0, chunk 2236

> The inferior branch of the oculomotor nerve [III] innervates the medial rectus, and the abducent nerve [VI] innervates the lateral rectus. To isolate the function of and test the medial and lateral rectus muscles, a patient is asked to track a physician’s finger medially and laterally, respectively, in the horizontal plane (Fig. 8.97B). The oblique muscles are in the superior and inferior parts of

**[B] `medrag-anatomy_gray:2235`** — hal. 0, chunk 2235

> The orientation and actions of the medial and lateral rectus muscles are more straightforward than those of the superior and inferior rectus muscles. The medial rectus originates from the medial part of the common tendinous ring medial to and below the optic canal, whereas the lateral rectus originates from the lateral part of the common tendinous ring as the common tendinous ring bridges the supe

**[C] `medrag-anatomy_gray:2232`** — hal. 0, chunk 2232

> Loss of oculomotor nerve [III] function results in complete ptosis or drooping of the superior eyelid, whereas loss of sympathetic innervation to the superior tarsal muscle results in partial ptosis. Four rectus muscles occupy medial, lateral, inferior, and superior positions as they pass from their origins posteriorly to their points of attachment on the anterior half of the eyeball (Fig. 8.95 an

**[D] `medrag-anatomy_gray:2233`** — hal. 0, chunk 2233

> The superior rectus originates from the superior part of the common tendinous ring above the optic canal. The inferior rectus originates from the inferior part of the common tendinous ring below the optic canal (Fig. 8.96). As these muscles pass forward in the orbit to attach to the anterior half of the eyeball, they are also directed laterally (Fig. 8.95). Because of these orientations: Contracti

**[E] `medrag-anatomy_gray:2234`** — hal. 0, chunk 2234

> The superior branch of the oculomotor nerve [III] innervates the superior rectus, and the inferior branch of the oculomotor nerve [III] innervates the inferior rectus. To isolate the function of and to test the superior and inferior rectus muscles, a patient is asked to track a physician’s finger laterally and then either upward or downward (Fig. 8.97B). The first movement brings the axis of the e

**[F] `medrag-anatomy_gray:2237`** — hal. 0, chunk 2237

> The tendon of the superior oblique passes through the trochlea and turns laterally to cross the eyeball in a posterolateral direction. It continues deep to the superior rectus muscle and inserts into the outer posterior quadrant of the eyeball. Contraction of the superior oblique therefore directs the pupil down and out (Fig. 8.97A). The trochlear nerve [IV] innervates the superior oblique along i

**[G] `medrag-anatomy_gray:2238`** — hal. 0, chunk 2238

> The inferior oblique is the only extrinsic muscle that does not take origin from the posterior part of the orbit. It arises from the medial side of the floor of the orbit, just posterior to the orbital rim, and is attached to the orbital surface of the maxilla just lateral to the nasolacrimal groove (Fig. 8.95). The inferior oblique crosses the floor of the orbit in a posterolateral direction betw

**[H] `medrag-anatomy_gray:2231`** — hal. 0, chunk 2231

> Levator palpebrae superioris raises the upper eyelid (Table 8.8). It is the most superior muscle in the orbit, originating from the roof, just anterior to the optic canal on the inferior surface of the lesser wing of the sphenoid (Fig. 8.95B). Its primary point of insertion is into the anterior surface of the superior tarsus, but a few fibers also attach to the skin of the upper eyelid and the sup

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-nervous-001  (F/nervous)

**QUERY:** What is the Genital branch of genitofemoral nerve?

**MUST-HAVE:** genitalbranchofgenitofemoralnerve

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:816

**Teks kunci lama `medrag-anatomy_gray:816`:**

> Inguinal ligamentFemoral artery and veinInternal oblique muscleAponeurosis of internal oblique Spermatic cordConjoint tendonAnterior superior iliac spine Fig. 4.46 Transversus abdominis muscle and the inguinal canal. Fig. 4.47 A. Spermatic cord (men). B. Round ligament of uterus (women). Internal spermatic fasciaParietal layer of the tunica vaginalisAVisceral layer of the tunica vaginalisCavity of

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:1403`** — hal. 0, chunk 1403

> The femoral nerve originates from the lumbar plexus (spinal cord segments L2–L4) on the posterior abdominal wall and enters the femoral triangle of the thigh by passing under the inguinal ligament (Fig. 6.68). In the femoral triangle the femoral nerve lies on the lateral side of the femoral artery and is outside the femoral sheath, which surrounds the vessels. Before entering the thigh, the femora

**[B] `medrag-anatomy_gray:1321`** — hal. 0, chunk 1321

> The genitofemoral nerve passes anteroinferiorly through the psoas major muscle on the posterior abdominal wall and descends on the anterior surface of the psoas major (Fig. 6.36 and Table 6.1). Its genital branch innervates anterior aspects of the perineum. Its femoral branch passes into the thigh by crossing under the inguinal ligament where it is lateral to the femoral artery. It passes superfic

**[C] `medrag-anatomy_gray:794`** — hal. 0, chunk 794

> The genital branch continues downward and enters the inguinal canal through the deep inguinal ring. It continues through the canal and: in men, innervates the cremasteric muscle and terminates on the skin in the upper anterior part of the scrotum, and in women, accompanies the round ligament of the uterus and terminates on the skin of the mons pubis and labium majus. The femoral branch descends on

**[D] `medrag-anatomy_gray:796`** — hal. 0, chunk 796

> In the area of the obturator canal, the obturator nerve divides into anterior and posterior branches. On entering the medial compartment of the thigh, the two branches are separated by the obturator externus and adductor brevis muscles. Throughout their course through the medial compartment, these two branches supply: articular branches to the hip joint, muscular branches to the obturator externus

**[E] `medrag-anatomy_gray:797`** — hal. 0, chunk 797

> Femoral nerve (L2 to L4) The femoral nerve arises from the anterior rami of nerves L2 to L4 (Fig. 4.173). It descends through the substance of the psoas major muscle, emerging from the lower lateral border of the psoas major (Fig. 4.174). Continuing its descent, the femoral nerve lies between the lateral border of the psoas major and the anterior surface of the iliacus muscle. It is deep to the il

**[F] `medrag-anatomy_gray:793`** — hal. 0, chunk 793

> The ilio-inguinal nerve emerges through the superficial inguinal ring, along with the spermatic cord, and provides cutaneous innervation to the upper medial thigh, the root of the penis, and the anterior surface of the scrotum in men, or the mons pubis and labium majus in women (Fig. 4.175). Throughout its course, it also supplies branches to the abdominal musculature. The genitofemoral nerve aris

**[G] `medrag-anatomy_gray:1317`** — hal. 0, chunk 1317

> The femoral nerve carries contributions from the anterior rami of L2 to L4 and leaves the abdomen by passing through the gap between the inguinal ligament and superior margin of the pelvis to enter the femoral triangle on the anteromedial aspect of the thigh (Fig. 6.35 and Table 6.1). In the femoral triangle it is lateral to the femoral artery. The femoral nerve: innervates all muscles in the ante

**[H] `medrag-anatomy_gray:1320`** — hal. 0, chunk 1320

> The inferior gluteal nerve (Fig. 6.36 and Table 6.1) is formed by contributions from L5 to S2, leaves the pelvis through the greater sciatic foramen inferior to the piriformis muscle, and enters the gluteal region to supply the gluteus maximus. Terminal sensory branches of the ilio-inguinal nerve (L1) and the genitofemoral nerve (L1, L2) descend into the upper thigh from the lumbar plexus. The ili

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-nervous-005  (F/nervous)

**QUERY:** Where is the Flocculus located?

**MUST-HAVE:** flocculus

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:2966

**Teks kunci lama `medrag-anatomy_gray:2966`:**

> Within the posterior cranial fossa, the cerebellum is covered by the tentorium cerebelli of the dura mater (eFig. 9.17) and connects to the posterior surface of the brainstem via the superior, middle, and inferior cerebellar peduncles (eFig. 9.62). Anteriorly, the cerebellum forms the roof of the fourth ventricle (eFig. 9.14). On its surface, the cerebellum has several convoluted folds, or folia, 

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:2960`** — hal. 0, chunk 2960

> The lentiform nucleus (Latin for “lens-shaped”) includes the globus pallidus and putamen, which appear lens-shaped when viewed laterally. Both of these structures are lateral to the internal capsule, which separates them from the thalamus and caudate nucleus medially (eFig. 9.58). Laterally, the putamen is bordered by the external capsule, a thin layer of white matter adjacent to a thin gray-matte

**[B] `medrag-anatomy_gray:2919`** — hal. 0, chunk 2919

> the cerebellum and forms the floor of the fourth ventricle (eFig. 9.32A). Along the midline of the posterior surface is a prominent bump, the facial colliculus, which represents the relationship between the facial nerve fibers as they wind around the nucleus of the abducent nerve (eFig. 9.33C).

**[C] `medrag-anatomy_gray:2962`** — hal. 0, chunk 2962

> contributes to the floor of the lateral ventricle. Near the posterior border of the thalamus the body of the caudate transitions into the tail. The tail continues anteriorly within the roof of the inferior horn of the lateral ventricle to terminate in the amygdaloid nucleus (eFig. 9.59).

**[D] `medrag-anatomy_gray:2967`** — hal. 0, chunk 2967

> Each fold or folia of the cerebellar cortex has a central core of white matter covered by a thin layer of gray matter superficially. In sections parallel to the median plane, the branching pattern of the folia can be appreciated; this is often referred to as the arbor vitae (eFig. 9.28). Deep within the white matter of each hemisphere are four masses of cerebellar nuclei. From lateral to medial th

**[E] `medrag-anatomy_gray:2966`** — hal. 0, chunk 2966

> Within the posterior cranial fossa, the cerebellum is covered by the tentorium cerebelli of the dura mater (eFig. 9.17) and connects to the posterior surface of the brainstem via the superior, middle, and inferior cerebellar peduncles (eFig. 9.62). Anteriorly, the cerebellum forms the roof of the fourth ventricle (eFig. 9.14). On its surface, the cerebellum has several convoluted folds, or folia, 

**[F] `medrag-anatomy_gray:3014`** — hal. 0, chunk 3014

> Efferent axons leaving the hippocampal formation primarily exit from the subiculum and form the fornix (Latin for “arch”), a white matter structure that arches over the ventricular system (eFig. 9.95). The fornix begins with axons exiting the hippocampus to form the alveus along the ventricular surface of the hippocampus. As the axons come together medially, they form a bundle referred to as the f

**[G] `medrag-anatomy_gray:2917`** — hal. 0, chunk 2917

> Approximately 2 cm in length, the midbrain connects the forebrain to the pons caudally and the cerebellum posteriorly (eFig. 9.32A). Along the midline of the anterior surface there is a deep depression, the interpeduncular fossa, which has several perforations on its surface where small vessels perforate through the floor of the fossa. On either side of the interpeduncular fossa are the crus cereb

**[H] `medrag-anatomy_gray:2923`** — hal. 0, chunk 2923

> The tectum is the most obvious landmark of the midbrain, as it consists of the prominent superior colliculi, inferior colliculi, and underlying cerebral aqueduct. Given the short length of the midbrain, stained serial sections typically include either the superior colliculi, which are located rostrally, or the inferior colliculi, which are caudal. In addition to the superior colliculi, within a ro

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-nervous-019  (F/nervous)

**QUERY:** What is the Inferior subscapular nerve?

**MUST-HAVE:** inferiorsubscapularnerve

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:1947, medrag-anatomy_gray:1779, medrag-anatomy_gray:1949

**Teks kunci lama `medrag-anatomy_gray:1947`:**

> Terminal nervesCordsDivisionsTrunksRoots (anterior rami)C5C6C7C8T1SuperiorMiddleInferiorLateralPosteriorPosteriorPosteriorPosteriorMedialAnteriorAnteriorAnterior ALateral pectoral nerveMedial pectoral nerveMedial cutaneous nerve of armMedial cutaneous nerve of forearmMusculocutaneousMedianRadialUlnarAxillaryLong thoracicnerveSuprascapular nerveDorsal scapular nerveContribution to phrenic nerveNerv

**Teks kunci lama `medrag-anatomy_gray:1779`:**

> All these nerves except the radial nerve innervate muscles associated with the shoulder region or the posterior wall of the axilla; the radial nerve passes into the arm and forearm. The superior subscapular, thoracodorsal, and inferior subscapular nerves originate sequentially from the posterior cord and pass directly into muscles associated with the posterior axillary wall (Fig. 7.56). The superi

**Teks kunci lama `medrag-anatomy_gray:1949`:**

> Axillary nerveSuperior subscapular nerveThoracodorsal nerveInferior subscapular nerveRadial nervePosterior cutaneousnerve of arm Fig. 7.57 Lymph nodes and vessels in the axilla. Humeral nodesCentral nodesPectoral nodesApical nodesInfraclavicular nodesSubscapular nodesAnterior scaleneMost of upper limbSome of upper limbAnterolateral body wall and centrolateral part of mammary glandRight subclavian 

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:1735`** — hal. 0, chunk 1735

> Generally, the suprascapular nerve has no cutaneous branches. The axillary nerve originates from the posterior cord of the brachial plexus. It exits the axilla by passing through the quadrangular space in the posterior wall of the axilla, and enters the posterior scapular region (Fig. 7.38). Together with the posterior circumflex humeral artery and vein, it is directly related to the posterior sur

**[B] `medrag-anatomy_gray:1750`** — hal. 0, chunk 1750

> The subscapularis is innervated by branches of the brachial plexus (the superior and inferior subscapular nerves), which originate in the axilla. The inferolateral aspect of the posterior wall of the axilla is formed by the terminal part of the teres major muscle and the tendon of the latissimus dorsi muscle (Fig. 7.45). These two structures lie under the posterior axillary fold, which marks the p

**[C] `medrag-anatomy_gray:1734`** — hal. 0, chunk 1734

> The two major nerves of the posterior scapular region are the suprascapular and axillary nerves, both of which originate from the brachial plexus in the axilla (Fig. 7.38). The suprascapular nerve originates in the base of the neck from the superior trunk of the brachial plexus. It passes posterolaterally from its origin, through the suprascapular foramen to reach the posterior scapular region, wh

**[D] `medrag-anatomy_gray:1770`** — hal. 0, chunk 1770

> The long thoracic nerve: originates from the anterior rami of C5 to C7, passes vertically down the neck, through the axillary inlet, and down the medial wall of the axilla to supply the serratus anterior muscle (Fig. 7.54), and lies on the superficial aspect of the serratus anterior muscle. Branches of the trunks The only branches from the trunks of the brachial plexus are two nerves that originat

**[E] `medrag-anatomy_gray:1771`** — hal. 0, chunk 1771

> The nerve to the subclavius muscle (C5 and C6) is a small nerve that: originates from the superior trunk of the brachial plexus, passes anteroinferiorly over the subclavian artery and vein, and innervates the subclavius muscle. Branches of the lateral cord Three nerves originate entirely or partly from the lateral cord (Fig. 7.53). The lateral pectoral nerve is the most proximal of the branches fr

**[F] `medrag-anatomy_gray:2025`** — hal. 0, chunk 2025

> The supraspinatus and infraspinatus muscles are supplied by the suprascapular nerve (C5, C6), which originates from the superior trunk of the brachial plexus. Given that only these muscles were involved, it is highly likely that the muscle atrophy is caused by denervation. Denervation may result from a direct nerve transection, nerve compression, or a pharmacological effect on the nerve. The typic

**[G] `medrag-anatomy_gray:1736`** — hal. 0, chunk 1736

> The suprascapular artery originates in the base of the neck as a branch of the thyrocervical trunk, which, in turn, is a major branch of the subclavian artery (Figs. 7.38 and 7.39). The vessel may also originate directly from the third part of the subclavian artery. The suprascapular artery normally enters the posterior scapular region superior to the suprascapular foramen, whereas the nerve passe

**[H] `medrag-anatomy_gray:1779`** — hal. 0, chunk 1779

> All these nerves except the radial nerve innervate muscles associated with the shoulder region or the posterior wall of the axilla; the radial nerve passes into the arm and forearm. The superior subscapular, thoracodorsal, and inferior subscapular nerves originate sequentially from the posterior cord and pass directly into muscles associated with the posterior axillary wall (Fig. 7.56). The superi

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-regions-008  (F/regions)

**QUERY:** What is the function of the Temporal region?

**MUST-HAVE:** temporalregion

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:2148, medrag-anatomy_gray:2197, medrag-anatomy_gray:2807

**Teks kunci lama `medrag-anatomy_gray:2148`:**

> The mandibular nerve [V3] also receives sensory branches from the skin of the lower face, cheek, lower lip, anterior part of the external ear, part of the external acoustic meatus and the temporal region, the anterior two-thirds of the tongue, the teeth of the lower jaw, the mastoid air cells, the mucous membranes of the cheek, the mandible, and dura in the middle cranial fossa. The abducent nerve

**Teks kunci lama `medrag-anatomy_gray:2197`:**

> The zygomaticotemporal nerve exits the skull through a foramen in the zygomatic bone and supplies the scalp over a small anterior area of the temple. The auriculotemporal nerve exits from the skull, deep to the parotid gland, passes just anterior to the ear, continues superiorly anterior to the ear until nearly reaching the vertex of the head, and supplies the scalp over the temporal region and an

**Teks kunci lama `medrag-anatomy_gray:2807`:**

> In the clinic Facelift surgery (rhytidectomy) aims to lift up and pull back the skin in the lower half of the face and neck to make the face more taught. Careful placement of the incisions is important to ensure there is no skin or facial distortion and to avoid hair loss. The commonest incisions are placed in the temporal region on each side, extending to the helices of the ears, then tracking be

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:2318`** — hal. 0, chunk 2318

> The temporal and infratemporal fossae are interconnected spaces on the lateral side of the head (Fig. 8.135). Their boundaries are formed by bone and soft tissues. The temporal fossa is superior to the infratemporal fossa, above the zygomatic arch, and communicates with the infratemporal fossa below through the gap between the zygomatic arch and the more medial surface of the skull. The infratempo

**[B] `medrag-anatomy_gray:2320`** — hal. 0, chunk 2320

> The tympanic part of the temporal bone forms the posteromedial corner of the roof of the infratemporal fossa, and also articulates with the head of the mandible to form the temporomandibular joint. The lateral surface of the squamous part of the temporal bone is marked by two surface features on the medial wall of the temporal fossa: a transversely oriented supramastoid crest, which extends poster

**[C] `medrag-anatomy_gray:2337`** — hal. 0, chunk 2337

> The temporalis muscle attaches down the anterior surface of the coronoid process and along the related margin of the ramus of the mandible, almost to the last molar tooth. The temporalis is a powerful elevator of the mandible. Because this movement involves posterior translocation of the head of the mandible from the articular tubercle of the temporal bone and back into the mandibular fossa, the t

**[D] `medrag-anatomy_gray:2338`** — hal. 0, chunk 2338

> The deep temporal nerves, usually two in number, originate from the anterior trunk of the mandibular nerve [V3] in the infratemporal fossa (Fig. 8.144). They pass superiorly and around the infratemporal crest of the greater wing of the sphenoid to enter the temporal fossa deep to the temporalis muscle, and supply the temporalis muscle. The zygomaticotemporal nerve is a branch of the zygomatic nerv

**[E] `medrag-anatomy_gray:2340`** — hal. 0, chunk 2340

> The middle temporal artery supplies the temporalis and anastomoses with branches of the deep temporal arteries. The wedge-shaped infratemporal fossa is inferior to the temporal fossa and between the ramus of the mandible laterally and the wall of the pharynx medially. It has a roof, a lateral wall, and a medial wall, and is open to the neck posteroinferiorly (Fig. 8.145): The roof is formed by the

**[F] `medrag-anatomy_gray:2910`** — hal. 0, chunk 2910

> Part III: Thalamus The thalamus (Greek for “inner chamber”) is a large, egg-shaped mass of gray matter derived from the diencephalon of the developing brain (see eTable 9.1). The most significant role of the thalamus is as a synaptic relay for pathways projecting to the cerebral cortex. However, the thalamus also acts as a gatekeeper to prevent or enhance information transfer, depending on the beh

**[G] `medrag-anatomy_gray:2335`** — hal. 0, chunk 2335

> Anteriorly, it is limited by the posterior surface of the frontal process of the zygomatic bone and the posterior surface of the zygomatic process of the frontal bone, which separate the temporal fossa behind from the orbit in front. Its inferior margin is marked by the zygomatic arch laterally and by the infratemporal crest of the greater wing of the sphenoid medially (Fig. 8.142B)—between these 

**[H] `medrag-anatomy_gray:2336`** — hal. 0, chunk 2336

> The temporalis muscle is a large, fan-shaped muscle that fills much of the temporal fossa (Fig. 8.143). It originates from the bony surfaces of the fossa superiorly to the inferior temporal line and is attached laterally to the surface of the temporal fascia. The more anterior fibers are oriented vertically while the more posterior fibers are oriented horizontally. The fibers converge inferiorly t

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-regions-011  (F/regions)

**QUERY:** What is the Carotid triangle?

**MUST-HAVE:** carotidtriangle

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:2727, medrag-anatomy_gray:2417, medrag-anatomy_gray:2407

**Teks kunci lama `medrag-anatomy_gray:2727`:**

> Fig. 8.170 Carotid triangle. SternocleidomastoidmuscleCarotid triangleSuperior belly ofomohyoid muscleCommon carotid arteryPosterior belly of digastric muscleInternal carotid arteryExternal carotid artery Fig. 8.171 Carotid system. Fig. 8.172 Glossopharyngeal nerve [IX] in the anterior triangle of the neck. Fig. 8.173 Vagus nerve [X] in the anterior triangle of the neck. Fig. 8.174 Accessory nerve

**Teks kunci lama `medrag-anatomy_gray:2417`:**

> Near the superior edge of the thyroid cartilage each common carotid artery divides into its two terminal branches—the external and internal carotid arteries (Fig. 8.170). The superior part of each common carotid artery and its division into external and internal carotid arteries occurs in the carotid triangle (Fig. 8.170), which is a subdivision of the anterior triangle of the neck (see Fig. 8.166

**Teks kunci lama `medrag-anatomy_gray:2407`:**

> The submandibular triangle is outlined by the inferior border of the mandible superiorly and the anterior and posterior bellies of the digastric muscle inferiorly. The submental triangle is outlined by the hyoid bone inferiorly, the anterior belly of the digastric muscle laterally, and the midline. The muscular triangle is outlined by the hyoid bone superiorly, the superior belly of the omohyoid m

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:2418`** — hal. 0, chunk 2418

> After its origin, the internal carotid artery ascends toward the base of the skull (Fig. 8.171). It gives off no branches in the neck and enters the cranial cavity through the carotid canal in the petrous part of the temporal bone. The internal carotid arteries supply the cerebral hemispheres, the eyes and the contents of the orbits, and the forehead. The external carotid arteries begin giving off

**[B] `medrag-anatomy_gray:2726`** — hal. 0, chunk 2726

> Fig. 8.164 Superficial veins of neck. Fig. 8.165 Placing a central venous catheter in the neck. A. Clinical procedure. B. Chest radiograph showing that the tip of the catheter is in the origin of the right atrium. Fig. 8.166 Borders and subdivisions of the anterior triangle of the neck. Submandibular triangleAnterior belly ofdigastric muscleSubmental triangleHyoid boneSuperior belly of omohyoid mu

**[C] `medrag-anatomy_gray:2439`** — hal. 0, chunk 2439

> Posterior triangle of the neck The posterior triangle of the neck is on the lateral aspect of the neck in direct continuity with the upper limb (Fig. 8.183). It is bordered: anteriorly by the posterior edge of the sternocleidomastoid muscle, posteriorly by the anterior edge of the trapezius muscle, basally by the middle one-third of the clavicle, and apically by the occipital bone just posterior t

**[D] `medrag-anatomy_gray:2666`** — hal. 0, chunk 2666

> The anterior triangles are associated with structures such as the airway and digestive tract, and nerves and vessels that pass between the thorax and head. They are also associated with the thyroid and parathyroid glands. The base of each posterior triangle is the middle one-third of the clavicle. The medial margin is the posterior border of the sternocleidomastoid muscle, and the lateral margin i

**[E] `medrag-anatomy_gray:2444`** — hal. 0, chunk 2444

> Two other small arteries also cross the base of the posterior triangle. These are the transverse cervical and the suprascapular arteries (Fig. 8.186). They are both branches of the thyrocervical trunk, which arises from the first part of the subclavian artery. After branching from the thyrocervical trunk, the transverse cervical artery passes laterally and slightly posteriorly across the base of t

**[F] `medrag-anatomy_gray:2417`** — hal. 0, chunk 2417

> Near the superior edge of the thyroid cartilage each common carotid artery divides into its two terminal branches—the external and internal carotid arteries (Fig. 8.170). The superior part of each common carotid artery and its division into external and internal carotid arteries occurs in the carotid triangle (Fig. 8.170), which is a subdivision of the anterior triangle of the neck (see Fig. 8.166

**[G] `medrag-anatomy_gray:2727`** — hal. 0, chunk 2727

> Fig. 8.170 Carotid triangle. SternocleidomastoidmuscleCarotid triangleSuperior belly ofomohyoid muscleCommon carotid arteryPosterior belly of digastric muscleInternal carotid arteryExternal carotid artery Fig. 8.171 Carotid system. Fig. 8.172 Glossopharyngeal nerve [IX] in the anterior triangle of the neck. Fig. 8.173 Vagus nerve [X] in the anterior triangle of the neck. Fig. 8.174 Accessory nerve

**[H] `medrag-anatomy_gray:2407`** — hal. 0, chunk 2407

> The submandibular triangle is outlined by the inferior border of the mandible superiorly and the anterior and posterior bellies of the digastric muscle inferiorly. The submental triangle is outlined by the hyoid bone inferiorly, the anterior belly of the digastric muscle laterally, and the midline. The muscular triangle is outlined by the hyoid bone superiorly, the superior belly of the omohyoid m

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-regions-015  (F/regions)

**QUERY:** Where is the Deltopectoral triangle located?

**MUST-HAVE:** deltopectoraltriangle

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:1700

**Teks kunci lama `medrag-anatomy_gray:1700`:**

> The cephalic and basilic veins originate from the dorsal venous network on the back of the hand. The cephalic vein originates over the anatomical snuffbox at the base of the thumb, passes laterally around the distal forearm to reach the anterolateral surface of the limb, and then continues proximally. It crosses the elbow, then passes up the arm into a triangular depression—the clavipectoral trian

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:2439`** — hal. 0, chunk 2439

> Posterior triangle of the neck The posterior triangle of the neck is on the lateral aspect of the neck in direct continuity with the upper limb (Fig. 8.183). It is bordered: anteriorly by the posterior edge of the sternocleidomastoid muscle, posteriorly by the anterior edge of the trapezius muscle, basally by the middle one-third of the clavicle, and apically by the occipital bone just posterior t

**[B] `medrag-anatomy_gray:2440`** — hal. 0, chunk 2440

> Numerous muscles participate in forming the borders and floor of the posterior triangle of the neck (Table 8.15). In addition, the omohyoid muscle passes across the inferior part of the posterior triangle before disappearing under the sternocleidomastoid muscle and emerging in the anterior triangle (Fig. 8.184). It is enclosed in the investing layer of cervical fascia and crosses the posterior tri

**[C] `medrag-anatomy_gray:1535`** — hal. 0, chunk 1535

> Finding the femoral artery in the femoral triangle The femoral artery passes into the femoral triangle (Fig. 6.130) of the lower limb from the abdomen. The femoral triangle is the depression formed in the anterior thigh between the medial margin of the adductor longus muscle, the medial margin of the sartorius muscle, and the inguinal ligament. The tendon of the adductor longus muscle can be palpa

**[D] `medrag-anatomy_gray:1732`** — hal. 0, chunk 1732

> The quadrangular space provides a passageway for nerves and vessels passing between more anterior regions (the axilla) and the posterior scapular region (Fig. 7.37). In the posterior scapular region, its boundaries are formed by: the inferior margin of the teres minor, the surgical neck of the humerus, the superior margin of the teres major, and the lateral margin of the long head of the triceps b

**[E] `medrag-anatomy_gray:1709`** — hal. 0, chunk 1709

> The lateral lip of the intertubercular sulcus is continuous inferiorly with a large V-shaped deltoid tuberosity on the lateral surface of the humerus midway along its length (Fig. 7.22), which is where the deltoid muscle inserts onto the humerus. In approximately the same position, but on the medial surface of the bone, there is a thin vertical roughening for attachment of the coracobrachialis mus

**[F] `medrag-anatomy_gray:2666`** — hal. 0, chunk 2666

> The anterior triangles are associated with structures such as the airway and digestive tract, and nerves and vessels that pass between the thorax and head. They are also associated with the thyroid and parathyroid glands. The base of each posterior triangle is the middle one-third of the clavicle. The medial margin is the posterior border of the sternocleidomastoid muscle, and the lateral margin i

**[G] `medrag-anatomy_gray:2407`** — hal. 0, chunk 2407

> The submandibular triangle is outlined by the inferior border of the mandible superiorly and the anterior and posterior bellies of the digastric muscle inferiorly. The submental triangle is outlined by the hyoid bone inferiorly, the anterior belly of the digastric muscle laterally, and the midline. The muscular triangle is outlined by the hyoid bone superiorly, the superior belly of the omohyoid m

**[H] `medrag-anatomy_gray:1939`** — hal. 0, chunk 1939

> DeltoidHead of humerusNeedleSubacromial-subdeltoid bursa Fig. 7.35 Lateral view of trapezius and deltoid muscles. AcromionSpine of thescapulaTrapeziusDeltoidDeltoid tuberosity of humerusClavicle Fig. 7.36 Attachments and neurovascular supply of the trapezius and deltoid muscles. AcromionSpine of scapulaTrapeziusDeltoidDeltoid tuberosity of humerusRhomboid minorRhomboid majorClavicleSuperior nuchal

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-regions-019  (F/regions)

**QUERY:** Where is the Heel region located?

**MUST-HAVE:** heelregion

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:1473

**Teks kunci lama `medrag-anatomy_gray:1473`:**

> The inferior surface of the body of the talus has a large oval concave facet (the posterior calcaneal articular facet) for articulation with the calcaneus. The posterior aspect of the body of the talus consists of a backward and medially facing projection (the posterior process). The posterior process is marked on its surface by a lateral tubercle and a medial tubercle, which bracket between them 

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:1474`** — hal. 0, chunk 1474

> The upper part is separated from the calcaneal tendon by a bursa. The lower part curves forward, is covered by subcutaneous tissue, is the weight-bearing region of the heel, and is continuous onto the plantar surface of the bone as the calcaneal tuberosity. The calcaneal tuberosity projects forward on the plantar surface as a large medial process and a small lateral process separated from each oth

**[B] `medrag-anatomy_gray:1454`** — hal. 0, chunk 1454

> The medial calcaneal nerve is often multiple and originates from the tibial nerve low in the leg near the ankle and descends onto the medial side of the heel. The medial calcaneal nerve innervates skin on the medial surface and sole of the heel (Fig. 6.90). Lateral compartment of leg There are two muscles in the lateral compartment of the leg—the fibularis longus and fibularis brevis (Fig. 6.91 an

**[C] `medrag-anatomy_gray:989`** — hal. 0, chunk 989

> 412.e1 412.e2 Fig. 4.1, cont’d Conceptual Overview • Relationship to Other Regions Fig. 4.13, cont’d Fig. 4.15, cont’d Fig. 4.47, cont’d. Fig. 4.50, cont’d In the clinic—cont’d In the clinic—cont’d In the clinic—cont’d In the clinic—cont’d In the clinic—cont’d In the clinic—cont’d In the clinic—cont’d In the clinic—cont’d In the clinic—cont’d In the clinic—cont’d Surface Anatomy • How to Find the 

**[D] `medrag-anatomy_gray:1271`** — hal. 0, chunk 1271

> The lower limb is divided into the gluteal region, thigh, leg, and foot on the basis of major joints, component bones, and superficial landmarks (Fig. 6.2): The gluteal region is posterolateral and between the iliac crest and the fold of skin (gluteal fold) that defines the lower limit of the buttocks. Anteriorly, the thigh is between the inguinal ligament and the knee joint—the hip joint is just 

**[E] `medrag-anatomy_gray:626`** — hal. 0, chunk 626

> The inferior horizontal plane (the intertubercular plane) connects the tubercles of the iliac crests, which are palpable structures 5 cm posterior to the anterior superior iliac spines, and passes through the upper part of the body of vertebra LV. The vertical planes pass from the midpoint of the clavicles inferiorly to a point midway between the anterior superior iliac spine and pubic symphysis. 

**[F] `medrag-anatomy_gray:1268`** — hal. 0, chunk 1268

> 524.e2 524.e1 Conceptual Overview • Relationship to Other Regions Fig. 5.10, cont’d Fig. 5.36, cont’d Fig. 5.45, cont’d Fig. 5.47, cont’d Fig. 5.59, cont’d Table 5.4 Branches of the sacral and coccygeal plexuses (spinal segments in parentheses do not consistently participate)—cont’d Fig. 5.63, cont’d Fig. 5.65, cont’d Fig. 5.76, cont’d Surface Anatomy • How to Define the Margins of the Perineum Su

**[G] `medrag-anatomy_gray:1439`** — hal. 0, chunk 1439

> In the upper leg, the heads of the gastrocnemius combine to form a single elongate muscle belly, which forms much of the soft tissue bulge identified as the calf. In the lower leg, the muscle fibers of the gastrocnemius converge with those of the deeper soleus muscle to form the calcaneal tendon, which attaches to the calcaneus (heel) of the foot. The gastrocnemius plantarflexes the foot at the an

**[H] `medrag-anatomy_gray:806`** — hal. 0, chunk 806

> McBurney’s point, which is one-third of the way up along a line from the right anterior superior iliac spine to the umbilicus. Defining surface regions to which pain from the gut is referred The abdomen can be divided into nine regions by a midclavicular sagittal plane on each side and by the subcostal and intertubercular planes, which pass through the body transversely (Fig. 4.182). These planes 

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-regions-022  (F/regions)

**QUERY:** Where is the Palm located?

**MUST-HAVE:** palm

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:1909, medrag-anatomy_gray:1904, medrag-anatomy_gray:1925

**Teks kunci lama `medrag-anatomy_gray:1909`:**

> The palmar digital nerves cross the palm deep to the palmar aponeurosis and the superficial palmar arch and enter the digits. They innervate skin on the palmar surfaces of the lateral three and one-half digits and cutaneous regions over the dorsal aspects of the distal phalanges (nail beds) of the same digits. In addition to skin, the digital nerves supply the lateral two lumbrical muscles. Superf

**Teks kunci lama `medrag-anatomy_gray:1904`:**

> The deep palmar arch gives rise to: three palmar metacarpal arteries, which join the common palmar digital arteries from the superficial palmar arch; and three perforating branches, which pass posteriorly between the heads of origin of the dorsal interossei to anastomose with the dorsal metacarpal arteries from the dorsal carpal arch. As generally found in the upper limb, the hand contains interco

**Teks kunci lama `medrag-anatomy_gray:1925`:**

> Visualizing the positions of the superficial and deep palmar arches The positions of the superficial and deep palmar arches in the hand can be visualized using bony landmarks, muscle eminences, and skin creases (Fig. 7.126). The superficial palmar arch begins as a continuation of the ulnar artery, which lies lateral to the pisiform bone at the wrist. The arch curves laterally across the palm anter

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:1909`** — hal. 0, chunk 1909

> The palmar digital nerves cross the palm deep to the palmar aponeurosis and the superficial palmar arch and enter the digits. They innervate skin on the palmar surfaces of the lateral three and one-half digits and cutaneous regions over the dorsal aspects of the distal phalanges (nail beds) of the same digits. In addition to skin, the digital nerves supply the lateral two lumbrical muscles. Superf

**[B] `medrag-anatomy_gray:1900`** — hal. 0, chunk 1900

> The remaining digits and the medial side of the index finger are supplied mainly by the ulnar artery. The ulnar artery and ulnar nerve enter the hand on the medial side of the wrist (Fig. 7.110). The vessel lies between the palmaris brevis and the flexor retinaculum and is lateral to the ulnar nerve and the pisiform bone. Distally, the ulnar artery is medial to the hook of the hamate bone and then

**[C] `medrag-anatomy_gray:1880`** — hal. 0, chunk 1880

> Transverse fibers interconnect the more longitudinally arranged bundles that continue into the digits. Vessels, nerves, and long flexor tendons lie deep to the palmar aponeurosis in the palm. The palmaris brevis, a small intrinsic muscle of the hand, is a quadrangular-shaped subcutaneous muscle that overlies the hypothenar muscles, ulnar artery, and superficial branch of the ulnar nerve at the med

**[D] `medrag-anatomy_gray:1926`** — hal. 0, chunk 1926

> The deep palmar arch originates on the lateral side of the palm deep to the long flexor tendons and between the proximal ends of metacarpals I and II. It arches medially across the palm and terminates by joining the deep branch of the ulnar artery, which passes through the base of the hypothenar muscles and between the pisiform and hook of the hamate. The deep palmar arch is more proximal in the h

**[E] `medrag-anatomy_gray:1969`** — hal. 0, chunk 1969

> Fig. 7.126 Visualizing the positions of the superficial and deep palmar arches, left hand. The proximal transverse skin crease of the palm and distal wrist crease are labeled and the superficial and deep palmar arches shown in overlay. This also shows the position of the pisiform and the hook of the hamate. Distal transverseskin crease of palmPisiform Distal wrist creaseProximal transverseskin cre

**[F] `medrag-anatomy_gray:1902`** — hal. 0, chunk 1902

> The radial artery curves around the lateral side of the wrist and passes over the floor of the anatomical snuffbox and into the deep plane of the palm by penetrating anteriorly through the back of the hand (Figs. 7.109 and 7.111). It passes between the two heads of the first dorsal interosseous muscle and then between the two heads of the adductor pollicis to access the deep plane of the palm and 

**[G] `medrag-anatomy_gray:1865`** — hal. 0, chunk 1865

> The hand (Fig. 7.93) is the region of the upper limb distal to the wrist joint. It is subdivided into three parts: the wrist (carpus), the metacarpus, and the digits (five fingers including the thumb). The five digits consist of the laterally positioned thumb and, medial to the thumb, the four fingers—the index, middle, ring, and little fingers. In the normal resting position, the fingers form a f

**[H] `medrag-anatomy_gray:1925`** — hal. 0, chunk 1925

> Visualizing the positions of the superficial and deep palmar arches The positions of the superficial and deep palmar arches in the hand can be visualized using bony landmarks, muscle eminences, and skin creases (Fig. 7.126). The superficial palmar arch begins as a continuation of the ulnar artery, which lies lateral to the pisiform bone at the wrist. The arch curves laterally across the palm anter

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-skeletal-001  (F/skeletal)

**QUERY:** What is the function of the Scaphoid bone?

**MUST-HAVE:** scaphoidbone

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:2006

**Teks kunci lama `medrag-anatomy_gray:2006`:**

> In the clinic Transection of the radial or ulnar artery Adult patients may transect the radial or ulnar artery because these vessels are relatively subcutaneous. A typical method of injury is when the hand is forced through a plate glass window. Fortunately, the dual supply to the hand usually enables the surgeon to tie off either the ulnar or the radial artery, without significant consequence. In

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:1882`** — hal. 0, chunk 1882

> The floor of the impression is formed by the scaphoid and trapezium, and the distal ends of the tendons of the extensor carpi radialis longus and extensor carpi radialis brevis. The radial artery passes obliquely through the anatomical snuffbox, deep to the extensor tendons of the thumb and lies adjacent to the scaphoid and trapezium. Terminal parts of the superficial branch of the radial nerve pa

**[B] `medrag-anatomy_gray:1819`** — hal. 0, chunk 1819

> The posterior surface of the radius is characterized by the presence of a large dorsal tubercle, which acts as a pulley for the tendon of one of the extensor muscles of the thumb (extensor pollicis longus). The medial surface is marked by a prominent facet for articulation with the distal end of the ulna (Fig. 7.80). The lateral surface of the radius is diamond shaped and extends distally as a rad

**[C] `medrag-anatomy_gray:1868`** — hal. 0, chunk 1868

> The trapezium articulates with the metacarpal bone of the thumb and has a distinct tubercle on its palmar surface that projects anteriorly. The largest of the carpal bones, the capitate, articulates with the base of metacarpal III. The hamate, which is positioned just lateral and distal to the pisiform, has a prominent hook (hook of hamate) on its palmar surface that projects anteriorly. The carpa

**[D] `medrag-anatomy_gray:1867`** — hal. 0, chunk 1867

> The small carpal bones of the wrist are arranged in two rows, a proximal and a distal row, each consisting of four bones (Fig. 7.94). From lateral to medial and when viewed from anteriorly, the proximal row of bones consists of: the boat-shaped scaphoid, the lunate, which has a crescent shape, the three-sided triquetrum bone, and the pea-shaped pisiform (Fig. 7.94). The pisiform is a sesamoid bone

**[E] `medrag-anatomy_gray:1866`** — hal. 0, chunk 1866

> The hand is a mechanical and sensory tool. Many of the features of the upper limb are designed to facilitate positioning the hand in space. There are three groups of bones in the hand: The eight carpal bones are the bones of the wrist. The five metacarpals (I to V) are the bones of the metacarpus. The phalanges are the bones of the digits—the thumb has only two; the rest of the digits have three (

**[F] `medrag-anatomy_gray:1787`** — hal. 0, chunk 1787

> Approximately in the middle of the shaft, the medial border is marked by thin elongate roughening for the attachment of the coracobrachialis muscle. Intermuscular septa, which separate the anterior compartment from the posterior compartment, attach to the medial and lateral borders (Fig. 7.61). Distally, the bone becomes flattened, and these borders expand as the lateral supraepicondylar ridge (la

**[G] `medrag-anatomy_gray:1869`** — hal. 0, chunk 1869

> The expansive proximal surfaces of the scaphoid and lunate articulate with the radius to form the wrist joint. The carpal bones do not lie in a flat plane; rather, they form an arch, whose base is directed anteriorly (Fig. 7.94). The lateral side of this base is formed by the tubercles of the scaphoid and trapezium. The medial side is formed by the pisiform and the hook of the hamate. The flexor r

**[H] `medrag-anatomy_gray:1871`** — hal. 0, chunk 1871

> Each phalanx has a base, a shaft (body), and distally, a head. The base of each proximal phalanx articulates with the head of the related metacarpal bone. The head of each distal phalanx is nonarticular and flattened into a crescent-shaped palmar tuberosity, which lies under the palmar pad at the end of the digit. The wrist joint is a synovial joint between the distal end of the radius and the art

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-skeletal-012  (F/skeletal)

**QUERY:** What is the function of the Scapula?

**MUST-HAVE:** scapula

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:1726, medrag-anatomy_gray:169, medrag-anatomy_gray:1727

**Teks kunci lama `medrag-anatomy_gray:1726`:**

> The levator scapulae muscle is innervated by the dorsal scapular nerve and directly from C3 and C4 spinal nerves. The levator scapulae elevates the scapula. The rhomboid minor and major muscles attach medially to the vertebral column and descend laterally to attach to the medial border of the scapula inferior to the levator scapulae muscle (Fig. 7.36). The rhomboid minor originates from the lower 

**Teks kunci lama `medrag-anatomy_gray:169`:**

> Levator scapulae is a slender muscle that descends from the transverse processes of the upper cervical vertebrae to the upper portion of the scapula on its medial border at the superior angle (Figs. 2.43 and 2.45 and Table 2.1). It elevates the scapula and may assist other muscles in rotating the lateral aspect of the scapula inferiorly. The levator scapulae is innervated by branches from the ante

**Teks kunci lama `medrag-anatomy_gray:1727`:**

> The rhomboid muscles are innervated by the dorsal scapular nerve, which is a branch of the brachial plexus. The rhomboid minor and major retract and elevate the scapula. The posterior scapular region occupies the posterior aspect of the scapula and is located deep to the trapezius and deltoid muscles (Fig. 7.37 and Table 7.2). It contains four muscles, which pass between the scapula and proximal e

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:1704`** — hal. 0, chunk 1704

> The scapula is a large, flat triangular bone with: three angles (lateral, superior, and inferior), three borders (superior, lateral, and medial), two surfaces (costal and posterior), and three processes (acromion, spine, and coracoid process) (Fig. 7.21). The lateral angle of the scapula is marked by a shallow, somewhat comma-shaped glenoid cavity, which articulates with the head of the humerus to

**[B] `medrag-anatomy_gray:1725`** — hal. 0, chunk 1725

> The major function of the deltoid muscle is abduction of the arm. The deltoid muscle is innervated by the axillary nerve, which is a branch of the posterior cord of the brachial plexus. The axillary nerve and associated blood vessels (the posterior circumflex humeral artery and vein) enter the deltoid by passing posteriorly around the surgical neck of the humerus. The levator scapulae originates f

**[C] `medrag-anatomy_gray:1723`** — hal. 0, chunk 1723

> Deep to the trapezius the scapula is attached to the vertebral column by three muscles—the levator scapulae, rhomboid minor, and rhomboid major. These three muscles work with the trapezius (and with muscles found anteriorly) to position the scapula on the trunk. The trapezius muscle has an extensive origin from the axial skeleton, which includes sites on the skull and the vertebrae, from CI to TXI

**[D] `medrag-anatomy_gray:1705`** — hal. 0, chunk 1705

> A prominent spine subdivides the posterior surface of the scapula into a small, superior supraspinous fossa and a much larger, inferior infraspinous fossa (Fig. 7.21A). The acromion, which is an anterolateral projection of the spine, arches over the glenohumeral joint and articulates, via a small oval facet on its distal end, with the clavicle. The region between the lateral angle of the scapula a

**[E] `medrag-anatomy_gray:1706`** — hal. 0, chunk 1706

> The lateral border of the scapula is strong and thick for muscle attachment, whereas the medial border and much of the superior border is thin and sharp. The superior border is marked on its lateral end by: the coracoid process, a hook-like structure that projects anterolaterally and is positioned directly inferior to the lateral part of the clavicle; and the small but distinct suprascapular notch

**[F] `medrag-anatomy_gray:169`** — hal. 0, chunk 169

> Levator scapulae is a slender muscle that descends from the transverse processes of the upper cervical vertebrae to the upper portion of the scapula on its medial border at the superior angle (Figs. 2.43 and 2.45 and Table 2.1). It elevates the scapula and may assist other muscles in rotating the lateral aspect of the scapula inferiorly. The levator scapulae is innervated by branches from the ante

**[G] `medrag-anatomy_gray:1911`** — hal. 0, chunk 1911

> Nerves can become entrapped or be damaged in regions where they are related to bone or pass through confined spaces. Bony landmarks and muscles of the posterior scapular region The medial border, inferior angle, and part of the lateral border of the scapula can be palpated on a patient, as can the spine and acromion. The superior border and angle of the scapula are deep to soft tissue and are not 

**[H] `medrag-anatomy_gray:1702`** — hal. 0, chunk 1702

> The shoulder is the region of upper limb attachment to the trunk. The bone framework of the shoulder consists of: the clavicle and scapula, which form the pectoral girdle (shoulder girdle), and the proximal end of the humerus. The superficial muscles of the shoulder consist of the trapezius and deltoid muscles, which together form the smooth muscular contour over the lateral part of the shoulder. 

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-skeletal-016  (F/skeletal)

**QUERY:** Where is the Fibula located?

**MUST-HAVE:** fibula

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:1498, medrag-anatomy_gray:1450, medrag-anatomy_gray:1455

**Teks kunci lama `medrag-anatomy_gray:1498`:**

> Fibular (peroneal) retinacula bind the tendons of the fibularis longus and fibularis brevis muscles to the lateral side of the foot (Fig. 6.112): A superior fibular retinaculum extends between the lateral malleolus and the calcaneus. An inferior fibular retinaculum attaches to the lateral surface of the calcaneus around the fibular trochlea and blends above with the fibers of the inferior extensor

**Teks kunci lama `medrag-anatomy_gray:1450`:**

> In the leg, the posterior tibial artery supplies adjacent muscles and bone and has two major branches, the circumflex fibular artery and the fibular artery: The circumflex fibular artery passes laterally through the soleus muscle and around the neck of the fibula to connect with the anastomotic network of vessels surrounding the knee (Fig. 6.89; see also Fig. 6.80). The fibular artery parallels th

**Teks kunci lama `medrag-anatomy_gray:1455`:**

> The common fibular nerve passes anteriorly around the fibular neck between the attachments of the fibularis longus to the fibular head and shaft. Distally, the fibularis longus descends in the leg to form a tendon, which, in order: passes posterior to the lateral malleolus in a shallow bony groove, swings forward to enter the lateral side of the foot, descends obliquely down the lateral side of th

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:1434`** — hal. 0, chunk 1434

> The posterior surface is marked by a vertical crest (medial crest), which divides the posterior surface into two parts each attached to a different deep flexor muscle. The distal end of the fibula expands to form the spade-shaped lateral malleolus (Fig. 6.85). The medial surface of the lateral malleolus bears a facet for articulation with the lateral surface of the talus, thereby forming the later

**[B] `medrag-anatomy_gray:1433`** — hal. 0, chunk 1433

> The fibula is not involved in weight-bearing. The fibular shaft is therefore much narrower than the shaft of the tibia. Also, and except for the ends, the fibula is enclosed by muscles. Like the tibia, the shaft of the fibula is triangular in cross section and has three borders and three surfaces for the attachment of muscles, intermuscular septa, and ligaments (Fig. 6.85). The interosseous border

**[C] `medrag-anatomy_gray:1566`** — hal. 0, chunk 1566

> BCLateral condyleRoughened and perforated areaSite of attachment of sartorius, gracilis, and semitendinosus musclesShaft of tibiaGrooveTibial tuberosityMedial condyleAnterior attachment ofmedial meniscusTubercles of intercondylar eminenceAnterior Anterior borderLateral surfaceInterosseous borderPosterior surfacePosteriorMedial borderMedial surfaceAttachment of medial meniscusAttachment of posterio

**[D] `medrag-anatomy_gray:1277`** — hal. 0, chunk 1277

> The leg contains two bones: The tibia is medial in position, is larger than the laterally positioned fibula, and is the weight-bearing bone. The fibula does not take part in the knee joint and forms only the most lateral part of the ankle joint—proximally, it forms a small synovial joint (superior tibiofibular joint) with the inferolateral surface of the head of the tibia. The tibia and fibula are

**[E] `medrag-anatomy_gray:1432`** — hal. 0, chunk 1432

> The posterior surface of the box-like distal end of the tibia is marked by a vertical groove, which continues inferiorly and medially onto the posterior surface of the medial malleolus. The groove is for the tendon of the tibialis posterior muscle. The lateral surface of the distal end of the tibia is occupied by a deep triangular notch (the fibular notch), to which the distal head of the fibula i

**[F] `medrag-anatomy_gray:1372`** — hal. 0, chunk 1372

> The lateral surface, between the anterior and interosseous borders, is smooth and unremarkable. Proximal end of fibula The fibula is the lateral bone of the leg and does not take part in formation of the knee joint or in weight-bearing. It is much smaller than the tibia and has a small proximal head, a narrow neck, and a delicate shaft, which ends as the lateral malleolus at the ankle. The head of

**[G] `medrag-anatomy_gray:1429`** — hal. 0, chunk 1429

> The tibia is the weight-bearing bone of the leg and is therefore much larger than the fibula. Above, it takes part in the formation of the knee joint and below it forms the medial malleolus and most of the bony surface for articulation of the leg with the foot at the ankle joint. The leg is divided into anterior (extensor), posterior (flexor), and lateral (fibular) compartments by: an interosseous

**[H] `medrag-anatomy_gray:1373`** — hal. 0, chunk 1373

> The neck of the fibula separates the expanded head from the shaft. The common fibular nerve lies against the posterolateral aspect of the neck. Like the tibia, the shaft of the fibula has three borders (anterior, posterior, and interosseous) and three surfaces (lateral, posterior, and medial), which lie between the borders (Fig. 6.56): The anterior border is sharp midshaft and begins superiorly fr

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-skeletal-019  (F/skeletal)

**QUERY:** What is the Medial cuneiform bone?

**MUST-HAVE:** medialcuneiformbone

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:1478

**Teks kunci lama `medrag-anatomy_gray:1478`:**

> From lateral to medial, the distal group of tarsal bones consists of (Fig. 6.96): The cuboid (Greek for “cube”), which articulates posteriorly with the calcaneus, medially with the lateral cuneiform, and anteriorly with the bases of the lateral two metatarsals—the tendon of the fibularis longus muscle lies in a prominent groove on the anterior plantar surface, which passes obliquely forward across

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:1512`** — hal. 0, chunk 1512

> The medial head originates from the tendon of the tibialis posterior muscle as it passes into the sole of the foot. The medial and lateral heads unite and give rise to a muscle belly, which itself is separated into medial and lateral parts adjacent to the plantar surface of metatarsal I. Each part of the muscle gives rise to a tendon that inserts on either the lateral or medial side of the base of

**[B] `medrag-anatomy_gray:1831`** — hal. 0, chunk 1831

> The pronator teres forms the medial border of the cubital fossa and rotates the radius over the ulna during pronation (Table 7.10). The muscle in the intermediate layer of the anterior compartment of the forearm is the flexor digitorum superficialis muscle (Fig. 7.86). This large muscle has two heads: the humero-ulnar head, which originates mainly from the medial epicondyle of the humerus and from

**[C] `medrag-anatomy_gray:1867`** — hal. 0, chunk 1867

> The small carpal bones of the wrist are arranged in two rows, a proximal and a distal row, each consisting of four bones (Fig. 7.94). From lateral to medial and when viewed from anteriorly, the proximal row of bones consists of: the boat-shaped scaphoid, the lunate, which has a crescent shape, the three-sided triquetrum bone, and the pea-shaped pisiform (Fig. 7.94). The pisiform is a sesamoid bone

**[D] `medrag-anatomy_gray:1371`** — hal. 0, chunk 1371

> The medial border is indistinct superiorly where it begins at the anterior end of the groove on the posterior surface of the medial tibial condyle, but is sharp in midshaft. The large medial surface of the shaft of the tibia, between the anterior and medial borders, is smooth and subcutaneous, and is palpable along almost its entire extent. Medial and somewhat inferior to the tibial tuberosity, th

**[E] `medrag-anatomy_gray:1478`** — hal. 0, chunk 1478

> From lateral to medial, the distal group of tarsal bones consists of (Fig. 6.96): The cuboid (Greek for “cube”), which articulates posteriorly with the calcaneus, medially with the lateral cuneiform, and anteriorly with the bases of the lateral two metatarsals—the tendon of the fibularis longus muscle lies in a prominent groove on the anterior plantar surface, which passes obliquely forward across

**[F] `medrag-anatomy_gray:1868`** — hal. 0, chunk 1868

> The trapezium articulates with the metacarpal bone of the thumb and has a distinct tubercle on its palmar surface that projects anteriorly. The largest of the carpal bones, the capitate, articulates with the base of metacarpal III. The hamate, which is positioned just lateral and distal to the pisiform, has a prominent hook (hook of hamate) on its palmar surface that projects anteriorly. The carpa

**[G] `medrag-anatomy_gray:1787`** — hal. 0, chunk 1787

> Approximately in the middle of the shaft, the medial border is marked by thin elongate roughening for the attachment of the coracobrachialis muscle. Intermuscular septa, which separate the anterior compartment from the posterior compartment, attach to the medial and lateral borders (Fig. 7.61). Distally, the bone becomes flattened, and these borders expand as the lateral supraepicondylar ridge (la

**[H] `medrag-anatomy_gray:1645`** — hal. 0, chunk 1645

> Bone tenderness at the navicular bone Inability to bear weight for four steps both immediately after the injury and in the emergency department In the clinic A bunion occurs on the medial aspect of the first metatarsophalangeal joint. This is an extremely important area of the foot because it is crossed by tendons and ligaments, which transmit and distribute the body’s weight during movement. It i

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-visceral-001  (F/visceral)

**QUERY:** What is the Submandibular duct?

**MUST-HAVE:** submandibularduct

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:2628, medrag-anatomy_gray:2627, medrag-anatomy_gray:2860

**Teks kunci lama `medrag-anatomy_gray:2628`:**

> The sublingual gland drains into the oral cavity via numerous small ducts (minor sublingual ducts), which open onto the crest of the sublingual fold. Occasionally, the more anterior part of the gland is drained by a duct (major sublingual duct) that opens together with the submandibular duct on the sublingual caruncle. Vessels that supply the parotid gland originate from the external carotid arter

**Teks kunci lama `medrag-anatomy_gray:2627`:**

> The lingual nerve loops under the submandibular duct, crossing first the lateral side and then the medial side of the duct, as the nerve descends anteromedially through the floor of the oral cavity and then ascends into the tongue. The sublingual glands are the smallest of the three major paired salivary glands. Each is almond shaped and is immediately lateral to the submandibular duct and associa

**Teks kunci lama `medrag-anatomy_gray:2860`:**

> A diagnosis of parotid duct calculus was made. The formation of stones in the salivary glands is not uncommon, but it is more likely in the submandibular gland than in the parotid gland because the saliva is more mucinous and the duct has a long upward course from the floor of the mouth. Nevertheless, stones do form in the parotid gland and the parotid ducts. Notably, most parotid duct calculi and

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:2174`** — hal. 0, chunk 2174

> The parotid duct leaves the anterior edge of the parotid gland midway between the zygomatic arch and the corner of the mouth (Fig. 8.62). It crosses the face in a transverse direction and, after crossing the medial border of the masseter muscle, turns deeply into the buccal fat pad and pierces the buccinator muscle. It opens into the oral cavity near the second upper molar tooth. pass just deep to

**[B] `medrag-anatomy_gray:2755`** — hal. 0, chunk 2755

> Fig. 8.264 Parotid gland. MasseterBuccinatorParotid duct(penetrates buccinator oppositecrown of 2nd upper molar tooth)SternocleidomastoidParotid glandExternal acoustic meatus Fig. 8.265 Submandibular and sublingual glands. A. Medial view. B. Posterior view. C. Anterior view. D. Anterosuperior view. Superior constrictor musclePterygomandibular rapheSmall ducts of sublingual glandSubmandibular ductS

**[C] `medrag-anatomy_gray:2628`** — hal. 0, chunk 2628

> The sublingual gland drains into the oral cavity via numerous small ducts (minor sublingual ducts), which open onto the crest of the sublingual fold. Occasionally, the more anterior part of the gland is drained by a duct (major sublingual duct) that opens together with the submandibular duct on the sublingual caruncle. Vessels that supply the parotid gland originate from the external carotid arter

**[D] `medrag-anatomy_gray:2860`** — hal. 0, chunk 2860

> A diagnosis of parotid duct calculus was made. The formation of stones in the salivary glands is not uncommon, but it is more likely in the submandibular gland than in the parotid gland because the saliva is more mucinous and the duct has a long upward course from the floor of the mouth. Nevertheless, stones do form in the parotid gland and the parotid ducts. Notably, most parotid duct calculi and

**[E] `medrag-anatomy_gray:2626`** — hal. 0, chunk 2626

> The elongate submandibular glands are smaller than the parotid glands but larger than the sublingual glands. Each is hook shaped (Fig. 8.265A,B): The larger arm of the hook is directed forward in the horizontal plane below the mylohyoid muscle and is therefore outside the boundaries of the oral cavity—this larger superficial part of the gland is directly against a shallow impression on the medial 

**[F] `medrag-anatomy_gray:2627`** — hal. 0, chunk 2627

> The lingual nerve loops under the submandibular duct, crossing first the lateral side and then the medial side of the duct, as the nerve descends anteromedially through the floor of the oral cavity and then ascends into the tongue. The sublingual glands are the smallest of the three major paired salivary glands. Each is almond shaped and is immediately lateral to the submandibular duct and associa

**[G] `medrag-anatomy_gray:2625`** — hal. 0, chunk 2625

> The gland normally extends anteriorly over the masseter muscle, and inferiorly over the posterior belly of the digastric muscle. The parotid duct passes anteriorly across the external surface of the masseter muscle and then turns medially to penetrate the buccinator muscle of the cheek and open into the oral cavity adjacent to the crown of the second upper molar tooth. The parotid gland encloses t

**[H] `medrag-anatomy_gray:2624`** — hal. 0, chunk 2624

> The tip of the tongue drains through the mylohyoid muscle into the submental nodes and then into mainly the jugulo-omohyoid node of the deep cervical chain. Salivary glands are glands that open or secrete into the oral cavity. Most are small glands in the submucosa or mucosa of the oral epithelium lining the tongue, palate, cheeks, and lips, and open into the oral cavity directly or via small duct

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-visceral-005  (F/visceral)

**QUERY:** What is the function of the Kidney?

**MUST-HAVE:** kidney

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:807, medrag-anatomy_gray:767, medrag-anatomy_gray:765

**Teks kunci lama `medrag-anatomy_gray:807`:**

> The kidneys project onto the back on either side of the midline and are related to the lower ribs (Fig. 4.183): The left kidney is a little higher than the right and reaches as high as rib XI. The superior pole of the right kidney reaches only as high as rib XII. The lower poles of the kidneys occur around the level of the disc between the LIII and LIV vertebrae. The hila of the kidneys and the be

**Teks kunci lama `medrag-anatomy_gray:767`:**

> Each kidney has a smooth anterior and posterior surface covered by a fibrous capsule, which is easily removable except during disease. On the medial margin of each kidney is the hilum of the kidney, which is a deep vertical slit through which renal vessels, lymphatics, and nerves enter and leave the substance of the kidney (Fig. 4.153). Internally, the hilum is continuous with the renal sinus. Per

**Teks kunci lama `medrag-anatomy_gray:765`:**

> Also passing posterior to the kidneys are the subcostal vessels and nerves and the iliohypogastric and ilio-inguinal nerves. The kidneys are enclosed in and associated with a unique arrangement of fascia and fat. Immediately outside the renal capsule, there is an accumulation of extraperitoneal fat—the perinephric fat (perirenal fat), which completely surrounds the kidney (Fig. 4.152). Enclosing t

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:2003`** — hal. 0, chunk 2003

> In the clinic Construction of a dialysis fistula Many patients throughout the world require renal dialysis for kidney failure. The patient’s blood is filtered and cleaned by the dialysis machine. Blood therefore has to be taken from patients into the filtering device and then returned to them. This process of dialysis occurs over many hours and requires considerable flow rates of 250–500 mL per mi

**[B] `medrag-anatomy_gray:859`** — hal. 0, chunk 859

> People who develop renal failure require dialysis to live. There are two methods. In the first method (hemodialysis), blood is taken from the circulation, dialyzed through a complex artificial membrane, and returned to the body. A high rate of blood flow is required to remove excess body fluid, exchange electrolytes, and remove noxious metabolites. To accomplish this, either an arteriovenous fistu

**[C] `medrag-anatomy_gray:762`** — hal. 0, chunk 762

> Fig. 4.143). Additional sensory fibers are supplied to the peripheral areas of the diaphragm by intercostal nerves. The bean-shaped kidneys are retroperitoneal in the posterior abdominal region (Fig. 4.149). They lie in the extraperitoneal connective tissue immediately lateral to the vertebral column. In the supine position, the kidneys extend from approximately vertebra TXII superiorly to vertebr

**[D] `medrag-anatomy_gray:833`** — hal. 0, chunk 833

> Fig. 4.150 Structures related to the anterior surface of each kidney. StomachLiverPancreasDescending colonSmall intestineSpleenJejunumRight colic flexureLeft colic flexureDescending part of duodenumRight suprarenal glandLeft suprarenal gland Fig. 4.151 Structures related to the posterior surface of each kidney. Fig. 4.152 Organization of fat and fascia surrounding the kidney. Fig. 4.153 Internal s

**[E] `medrag-anatomy_gray:763`** — hal. 0, chunk 763

> A small part of the superior pole is covered by the right suprarenal gland. Moving inferiorly, a large part of the rest of the upper part of the anterior surface is against the liver and is separated from it by a layer of peritoneum. Medially, the descending part of the duodenum is retroperitoneal and contacts the kidney. The inferior pole of the kidney, on its lateral side, is directly associated

**[F] `medrag-anatomy_gray:860`** — hal. 0, chunk 860

> In the second method (peritoneal dialysis), the peritoneum is used as the dialysis membrane. The large surface area of the peritoneal cavity is an ideal dialysis membrane for fluid and electrolyte exchange. To accomplish dialysis, a small tube is inserted through the abdominal wall and dialysis fluid is injected into the peritoneal cavity. Electrolytes and molecules are exchanged across the perito

**[G] `medrag-anatomy_gray:767`** — hal. 0, chunk 767

> Each kidney has a smooth anterior and posterior surface covered by a fibrous capsule, which is easily removable except during disease. On the medial margin of each kidney is the hilum of the kidney, which is a deep vertical slit through which renal vessels, lymphatics, and nerves enter and leave the substance of the kidney (Fig. 4.153). Internally, the hilum is continuous with the renal sinus. Per

**[H] `medrag-anatomy_gray:928`** — hal. 0, chunk 928

> The indications for such a procedure are many. In patients with distal ureteric obstruction the back pressure of urine within the ureters and the kidney significantly impairs the function of the kidney. This will produce renal failure and ultimately death. Furthermore, a dilated obstructed system is also susceptible to infection. In many cases, there is not only obstruction producing renal failure

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## F-visceral-008  (F/visceral)

**QUERY:** What is the Free taenia?

**MUST-HAVE:** freetaenia

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:688

**Teks kunci lama `medrag-anatomy_gray:688`:**

> The appendix is a narrow, hollow, blind-ended tube connected to the cecum. It has large aggregations of lymphoid tissue in its walls and is suspended from the terminal ileum by the mesoappendix (Fig. 4.83), which contains the appendicular vessels. Its point of attachment to the cecum is consistent with the highly visible free taeniae leading directly to the base of the appendix, but the location o

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:842`** — hal. 0, chunk 842

> eFig. 4.191 A computed tomogram, in the axial plane, of the pelvis demonstrates a loop of sigmoid colon with numerous diverticula and a large abscess in the pelvic cavity. Fig. 4.186 This postcontrast computed tomogram, in the axial plane, demonstrates two metastases situated within the right lobe of the liver. The left lobe of the liver is clear. The larger of the two metastases is situated to th

**[B] `medrag-anatomy_gray:636`** — hal. 0, chunk 636

> After attaching to the crest of the ilium, the transversalis fascia blends with the fascia covering the muscles associated with the upper regions of the pelvic bones and with similar fascia covering the muscles of the pelvic cavity. At this point, it is referred to as the parietal pelvic (or endopelvic) fascia. There is therefore a continuous layer of deep fascia surrounding the abdominal cavity t

**[C] `medrag-anatomy_gray:51`** — hal. 0, chunk 51

> covering the deep surface of the muscles of the abdominal wall (the transversalis fascia). This layer is referred to as extraperitoneal fascia. A similar layer of fascia in the thorax is termed the endothoracic fascia.

**[D] `medrag-anatomy_gray:2116`** — hal. 0, chunk 2116

> The tentorium cerebelli (Fig. 8.32) is a horizontal projection of the meningeal dura mater that covers and separates the cerebellum in the posterior cranial fossa from the posterior parts of the cerebral hemispheres. It is attached posteriorly to the occipital bone along the grooves for the transverse sinuses. Laterally, it is attached to the superior border of the petrous part of the temporal bon

**[E] `medrag-anatomy_gray:2498`** — hal. 0, chunk 2498

> The opening of the pharyngotympanic tube is posterior to and slightly above the level of the hard palate, and lateral to the top of the soft palate (Fig. 8.205A). Because the pharyngotympanic tube projects into the nasopharynx from a posterolateral direction, its posterior rim forms an elevation or bulge on the pharyngeal wall. Posterior to this tubal elevation (torus tubarius) is a deep recess (p

**[F] `medrag-anatomy_gray:1216`** — hal. 0, chunk 1216

> In the clinic Tumors of the testis account for a small percentage of malignancies in men. However, they generally occur in younger patients (between 20 and 40 years of age). When diagnosed at an early stage, most of these tumors are curable by surgery and chemotherapy. Early diagnosis of testicular tumors is extremely important. Abnormal lumps can be detected by palpation, and diagnosis can be mad

**[G] `medrag-anatomy_gray:688`** — hal. 0, chunk 688

> The appendix is a narrow, hollow, blind-ended tube connected to the cecum. It has large aggregations of lymphoid tissue in its walls and is suspended from the terminal ileum by the mesoappendix (Fig. 4.83), which contains the appendicular vessels. Its point of attachment to the cecum is consistent with the highly visible free taeniae leading directly to the base of the appendix, but the location o

**[H] `medrag-anatomy_gray:959`** — hal. 0, chunk 959

> Spread of the tumor is typically to the lymph node chains that drain the testes. The testes develop from structures adjacent to the renal vessels in the upper abdomen, between the transversalis fascia and the peritoneum. They normally migrate through the inguinal canals into the scrotum just before birth. The testes take with them their arterial supply, their venous drainage, their nerve supply, a

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## R-cardiovascular-003  (R/cardiovascular)

**QUERY:** How are the Anterior cerebral artery and the Cavernous sinus anatomically related?

**MUST-HAVE:** anteriorcerebralartery, cavernoussinus

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:2696

**Teks kunci lama `medrag-anatomy_gray:2696`:**

> Neurovascular bundleV1V2Connected togetheras a structural unitSkinAponeurosisPeriosteum1234BoneOutertableInnertableDiploëAnterior cerebral arteryInternal carotidarteryDiploic veinSuperior sagittal sinusCavernous sinusOptic tractsDuraPeriostial layerMeningeal layerArachnoidSubarachnoid spacePiaEmissary vein: can spread infection fromthe scalp into the cranial cavityConnective tissue:contains majorn

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:2137`** — hal. 0, chunk 2137

> Structures passing through each cavernous sinus are: the internal carotid artery, and the abducent nerve [VI]. Structures in the lateral wall of each cavernous sinus are, from superior to inferior: the oculomotor nerve [III], the trochlear nerve [IV], the ophthalmic nerve [V1], and the maxillary nerve [V2]. Connecting the right and left cavernous sinuses are the intercavernous sinuses on the anter

**[B] `medrag-anatomy_gray:2902`** — hal. 0, chunk 2902

> The two anterior cerebral arteries anastomose proximally via the anterior communicating artery, anterior to the optic chiasm (eFig. 9.22). Distal to this connection, the anterior cerebral artery (ACA) courses along the medial aspect of the cerebral hemisphere within the longitudinal fissure and follows the superior border of the corpus callosum to the anterior portion of the parietal lobe. Along i

**[C] `medrag-anatomy_gray:2904`** — hal. 0, chunk 2904

> The posterior cerebral cortex receives vascular supply from the vertebral-basilar system of arteries. This system begins with the vertebral arteries bilaterally, which arise from the subclavian arteries and ascend through the foramen transversarium of the cervical vertebrae in the neck. After entering the foramen magnum at the level of the pontomedullary junction, the arteries join to form the bas

**[D] `medrag-anatomy_gray:2130`** — hal. 0, chunk 2130

> A third branch joins with its companion from the other side to form the single anterior spinal artery, which then descends in the anterior median fissure of the spinal cord. The basilar artery travels in a rostral direction along the anterior aspect of the pons (Fig. 8.39). Its branches in a caudal to rostral direction include the anterior inferior cerebellar arteries, several small pontine arteri

**[E] `medrag-anatomy_gray:2901`** — hal. 0, chunk 2901

> Vascular supply to the brain is divided into the anterior circulation arising from the internal carotid arteries and posterior circulation from the vertebral arteries (eFig. 9.20). The internal carotid arteries arise from the branching of the common carotid arteries at the level of the fourth cervical vertebra. Bilaterally the arteries course through the neck to enter the middle cranial fossa thro

**[F] `medrag-anatomy_gray:2573`** — hal. 0, chunk 2573

> The anterior and posterior ethmoidal arteries (Fig. 8.243) originate in the orbit from the ophthalmic artery, which originates in the cranial cavity as a major branch of the internal carotid artery. They pass through canals in the medial wall of the orbit between the ethmoidal labyrinth and frontal bone, supply the adjacent paranasal sinuses, and then enter the cranial cavity immediately lateral a

**[G] `medrag-anatomy_gray:2136`** — hal. 0, chunk 2136

> The paired cavernous sinuses are against the lateral aspect of the body of the sphenoid bone on either side of the sella turcica (Figs. 8.45 and 8.46). They are of great clinical importance because of their connections and the structures that pass through them. The cavernous sinuses receive blood not only from cerebral veins but also from the ophthalmic veins (from the orbit) and emissary veins (f

**[H] `medrag-anatomy_gray:2908`** — hal. 0, chunk 2908

> Venous drainage from the superficial veins is primarily received by the superior sagittal sinus and cavernous sinus. Although the pattern of superficial veins coursing through the subarachnoid space from the cerebral cortex is quite variable, three veins appear to be fairly constant. Positioned in parallel to the lateral fissure is the superficial middle cerebral vein, which drains into the cavern

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## R-cardiovascular-008  (R/cardiovascular)

**QUERY:** How are the Azygos vein and the Left gastric artery anatomically related?

**MUST-HAVE:** azygosvein, leftgastricartery

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:758, medrag-anatomy_gray:453, medrag-anatomy_gray:757

**Teks kunci lama `medrag-anatomy_gray:758`:**

> Passing through the esophageal hiatus with the esophagus are the anterior and posterior vagal trunks, the esophageal branches of the left gastric artery and vein, and a few lymphatic vessels. The third large opening in the diaphragm is the caval opening, through which the inferior vena cava passes from the abdominal cavity to the thoracic cavity (Fig. 4.143) at approximately vertebra TVIII in the 

**Teks kunci lama `medrag-anatomy_gray:453`:**

> These constrictions have important clinical consequences. For example, a swallowed object is most likely to lodge at a constricted area. An ingested corrosive substance would move more slowly through a narrowed region, causing more damage at this site than elsewhere along the esophagus. Also, constrictions present problems during the passage of medical instruments. The arterial supply and venous d

**Teks kunci lama `medrag-anatomy_gray:757`:**

> The medial and lateral arcuate ligaments serve as points of origin for some of the muscular components of the diaphragm. Structures passing through or around the diaphragm Numerous structures pass through or around the diaphragm (Fig. 4.143): The aorta passes posterior to the diaphragm and anterior to the vertebral bodies at the lower level of vertebra TXII; it is between the two crura of the diap

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:830`** — hal. 0, chunk 830

> Fig. 4.129 Arterial supply to the abdominal parts of the gastrointestinal system and to the spleen. Fig. 4.130 Enlarged marginal artery connecting the superior and inferior mesenteric arteries. Digital subtraction angiogram. Fig. 4.131 Portal vein. Fig. 4.132 Venous drainage of the abdominal portion of the gastrointestinal tract. Fig. 4.133 Portosystemic anastomoses. LiverSpleenSplenic veinSuperio

**[B] `medrag-anatomy_gray:458`** — hal. 0, chunk 458

> Azygos system of veins The azygos system of veins consists of a series of longitudinal vessels on each side of the body that drain blood from the body wall and move it superiorly to empty into the superior vena cava. Blood from some of the thoracic viscera may also enter the system, and there are anastomotic connections with abdominal veins. The longitudinal vessels may or may not be continuous an

**[C] `medrag-anatomy_gray:459`** — hal. 0, chunk 459

> There is significant variation in the origin, course, tributaries, anastomoses, and termination of these vessels. The azygos vein arises opposite vertebra LI or LII at the junction between the right ascending lumbar vein and the right subcostal vein (Fig. 3.102). It may also arise as a direct branch of the inferior vena cava, which is joined by a common trunk from the junction of the right ascendi

**[D] `medrag-anatomy_gray:460`** — hal. 0, chunk 460

> Tributaries of the azygos vein include: the right superior intercostal vein (a single vessel formed by the junction of the second, third, and fourth intercostal veins), fifth to eleventh right posterior intercostal veins, the hemiazygos vein, the accessory hemiazygos vein, esophageal veins, mediastinal veins, pericardial veins, and right bronchial veins. The hemiazygos vein (inferior hemiazygos ve

**[E] `medrag-anatomy_gray:777`** — hal. 0, chunk 777

> Anterior to the abdominal aorta, as it descends, are the pancreas and splenic vein, the left renal vein, and the inferior part of the duodenum. Several left lumbar veins cross it posteriorly as they pass to the inferior vena cava. On its right side are the cisterna chyli, thoracic duct, azygos vein, right crus of the diaphragm, and the inferior vena cava. On its left side is the left crus of the d

**[F] `medrag-anatomy_gray:461`** — hal. 0, chunk 461

> Tributaries joining the hemiazygos vein include: the lowest four or five left posterior intercostal veins, esophageal veins, and mediastinal veins. The accessory hemiazygos vein (superior hemiazygos vein) descends on the left side from the superior portion of the posterior mediastinum to approximately vertebral level TVIII (Fig. 3.102). At this point, it crosses the vertebral column to join the az

**[G] `medrag-anatomy_gray:299`** — hal. 0, chunk 299

> The hemiazygos and accessory hemiazygos veins drain posterior and lateral parts of the left thoracic wall, pass immediately anterior to the bodies of thoracic vertebrae, and flow into the azygos vein on the right side, which ultimately connects with the superior vena cava. The arrangement of vessels and nerves that supply the thoracic wall reflects the segmental organization of the wall. Arteries 

**[H] `medrag-anatomy_gray:618`** — hal. 0, chunk 618

> Three large unpaired arteries branch from the anterior surface of the abdominal aorta to supply the abdominal part of the gastrointestinal tract and all of the structures (liver, pancreas, and gallbladder) to which this part of the gut gives rise during development (Fig. 4.17). These arteries pass through derivatives of the dorsal and ventral mesenteries to reach the target viscera. These vessels 

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## R-cardiovascular-012  (R/cardiovascular)

**QUERY:** How are the Azygos vein and the Superior mesenteric artery anatomically related?

**MUST-HAVE:** azygosvein, superiormesentericartery

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:777

**Teks kunci lama `medrag-anatomy_gray:777`:**

> Anterior to the abdominal aorta, as it descends, are the pancreas and splenic vein, the left renal vein, and the inferior part of the duodenum. Several left lumbar veins cross it posteriorly as they pass to the inferior vena cava. On its right side are the cisterna chyli, thoracic duct, azygos vein, right crus of the diaphragm, and the inferior vena cava. On its left side is the left crus of the d

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:618`** — hal. 0, chunk 618

> Three large unpaired arteries branch from the anterior surface of the abdominal aorta to supply the abdominal part of the gastrointestinal tract and all of the structures (liver, pancreas, and gallbladder) to which this part of the gut gives rise during development (Fig. 4.17). These arteries pass through derivatives of the dorsal and ventral mesenteries to reach the target viscera. These vessels 

**[B] `medrag-anatomy_gray:728`** — hal. 0, chunk 728

> Posterior to the neck of the pancreas, the superior mesenteric vein joins the splenic vein to form the portal vein. As a corresponding vein accompanies each branch of the superior mesenteric artery, tributaries to the superior mesenteric vein include jejunal, ileal, ileocolic, right colic, and middle colic veins. Additional tributaries include: the right gastro-omental vein, draining the right par

**[C] `medrag-anatomy_gray:458`** — hal. 0, chunk 458

> Azygos system of veins The azygos system of veins consists of a series of longitudinal vessels on each side of the body that drain blood from the body wall and move it superiorly to empty into the superior vena cava. Blood from some of the thoracic viscera may also enter the system, and there are anastomotic connections with abdominal veins. The longitudinal vessels may or may not be continuous an

**[D] `medrag-anatomy_gray:459`** — hal. 0, chunk 459

> There is significant variation in the origin, course, tributaries, anastomoses, and termination of these vessels. The azygos vein arises opposite vertebra LI or LII at the junction between the right ascending lumbar vein and the right subcostal vein (Fig. 3.102). It may also arise as a direct branch of the inferior vena cava, which is joined by a common trunk from the junction of the right ascendi

**[E] `medrag-anatomy_gray:715`** — hal. 0, chunk 715

> The superior mesenteric artery is crossed anteriorly by the splenic vein and the neck of the pancreas. Posterior to the artery are the left renal vein, the uncinate process of the pancreas, and the inferior part of the duodenum. After giving off its first branch (the inferior pancreaticoduodenal artery), the superior mesenteric artery gives off jejunal and ileal arteries on its left (Fig. 4.126). 

**[F] `medrag-anatomy_gray:727`** — hal. 0, chunk 727

> The superior mesenteric vein drains blood from the small intestine, cecum, ascending colon, and transverse colon (Fig. 4.132). It begins in the right iliac fossa as veins draining the terminal ileum, cecum, and appendix join, and ascends in the mesentery to the right of the superior mesenteric artery. Posterior to the neck of the pancreas, the superior mesenteric vein joins the splenic vein to for

**[G] `medrag-anatomy_gray:460`** — hal. 0, chunk 460

> Tributaries of the azygos vein include: the right superior intercostal vein (a single vessel formed by the junction of the second, third, and fourth intercostal veins), fifth to eleventh right posterior intercostal veins, the hemiazygos vein, the accessory hemiazygos vein, esophageal veins, mediastinal veins, pericardial veins, and right bronchial veins. The hemiazygos vein (inferior hemiazygos ve

**[H] `medrag-anatomy_gray:830`** — hal. 0, chunk 830

> Fig. 4.129 Arterial supply to the abdominal parts of the gastrointestinal system and to the spleen. Fig. 4.130 Enlarged marginal artery connecting the superior and inferior mesenteric arteries. Digital subtraction angiogram. Fig. 4.131 Portal vein. Fig. 4.132 Venous drainage of the abdominal portion of the gastrointestinal tract. Fig. 4.133 Portosystemic anastomoses. LiverSpleenSplenic veinSuperio

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## R-cardiovascular-018  (R/cardiovascular)

**QUERY:** How are the Azygos vein and the Marginal artery anatomically related?

**MUST-HAVE:** azygosvein, marginalartery

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:830

**Teks kunci lama `medrag-anatomy_gray:830`:**

> Fig. 4.129 Arterial supply to the abdominal parts of the gastrointestinal system and to the spleen. Fig. 4.130 Enlarged marginal artery connecting the superior and inferior mesenteric arteries. Digital subtraction angiogram. Fig. 4.131 Portal vein. Fig. 4.132 Venous drainage of the abdominal portion of the gastrointestinal tract. Fig. 4.133 Portosystemic anastomoses. LiverSpleenSplenic veinSuperio

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:1111`** — hal. 0, chunk 1111

> The median sacral veins coalesce to form a single vein that joins either the left common iliac vein or the junction of the two common iliac veins to form the inferior vena cava. The ovarian veins follow the course of the corresponding arteries; on the left, they join the left renal vein and, on the right, they join the inferior vena cava in the abdomen. Lymphatics from most pelvic viscera drain ma

**[B] `medrag-anatomy_gray:460`** — hal. 0, chunk 460

> Tributaries of the azygos vein include: the right superior intercostal vein (a single vessel formed by the junction of the second, third, and fourth intercostal veins), fifth to eleventh right posterior intercostal veins, the hemiazygos vein, the accessory hemiazygos vein, esophageal veins, mediastinal veins, pericardial veins, and right bronchial veins. The hemiazygos vein (inferior hemiazygos ve

**[C] `medrag-anatomy_gray:459`** — hal. 0, chunk 459

> There is significant variation in the origin, course, tributaries, anastomoses, and termination of these vessels. The azygos vein arises opposite vertebra LI or LII at the junction between the right ascending lumbar vein and the right subcostal vein (Fig. 3.102). It may also arise as a direct branch of the inferior vena cava, which is joined by a common trunk from the junction of the right ascendi

**[D] `medrag-anatomy_gray:458`** — hal. 0, chunk 458

> Azygos system of veins The azygos system of veins consists of a series of longitudinal vessels on each side of the body that drain blood from the body wall and move it superiorly to empty into the superior vena cava. Blood from some of the thoracic viscera may also enter the system, and there are anastomotic connections with abdominal veins. The longitudinal vessels may or may not be continuous an

**[E] `medrag-anatomy_gray:299`** — hal. 0, chunk 299

> The hemiazygos and accessory hemiazygos veins drain posterior and lateral parts of the left thoracic wall, pass immediately anterior to the bodies of thoracic vertebrae, and flow into the azygos vein on the right side, which ultimately connects with the superior vena cava. The arrangement of vessels and nerves that supply the thoracic wall reflects the segmental organization of the wall. Arteries 

**[F] `medrag-anatomy_gray:830`** — hal. 0, chunk 830

> Fig. 4.129 Arterial supply to the abdominal parts of the gastrointestinal system and to the spleen. Fig. 4.130 Enlarged marginal artery connecting the superior and inferior mesenteric arteries. Digital subtraction angiogram. Fig. 4.131 Portal vein. Fig. 4.132 Venous drainage of the abdominal portion of the gastrointestinal tract. Fig. 4.133 Portosystemic anastomoses. LiverSpleenSplenic veinSuperio

**[G] `medrag-anatomy_gray:777`** — hal. 0, chunk 777

> Anterior to the abdominal aorta, as it descends, are the pancreas and splenic vein, the left renal vein, and the inferior part of the duodenum. Several left lumbar veins cross it posteriorly as they pass to the inferior vena cava. On its right side are the cisterna chyli, thoracic duct, azygos vein, right crus of the diaphragm, and the inferior vena cava. On its left side is the left crus of the d

**[H] `medrag-anatomy_gray:461`** — hal. 0, chunk 461

> Tributaries joining the hemiazygos vein include: the lowest four or five left posterior intercostal veins, esophageal veins, and mediastinal veins. The accessory hemiazygos vein (superior hemiazygos vein) descends on the left side from the superior portion of the posterior mediastinum to approximately vertebral level TVIII (Fig. 3.102). At this point, it crosses the vertebral column to join the az

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## R-cardiovascular-023  (R/cardiovascular)

**QUERY:** How are the Brachiocephalic trunk and the Thyrocervical trunk anatomically related?

**MUST-HAVE:** brachiocephalictrunk, thyrocervicaltrunk

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:2434

**Teks kunci lama `medrag-anatomy_gray:2434`:**

> The posterior glandular branch passes to the posterior side of the gland and may anastomose with the inferior thyroid artery (Fig. 8.180). Inferior thyroid artery. The inferior thyroid artery is a branch of the thyrocervical trunk, which arises from the first part of the subclavian artery (Figs. 8.179 and 8.180). It ascends along the medial edge of the anterior scalene muscle, passes posteriorly t

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:2458`** — hal. 0, chunk 2458

> Inferior thyroid artery. The inferior thyroid artery (Fig. 8.191) is the superior continuation of the thyrocervical trunk. It ascends, anterior to the anterior scalene muscle, and eventually turns medially, crossing posterior to the carotid sheath and its contents and anterior to the vertebral artery. Reaching the posterior surface of the thyroid gland it supplies the thyroid gland. When the infer

**[B] `medrag-anatomy_gray:2459`** — hal. 0, chunk 2459

> Transverse cervical artery. The middle branch of the thyrocervical trunk is the transverse cervical artery (Fig. 8.191). This branch passes laterally, across the anterior surface of the anterior scalene muscle and the phrenic nerve, and enters and crosses the base of the posterior triangle of the neck. It continues to the deep surface of the trapezius muscle, where it divides into superficial and 

**[C] `medrag-anatomy_gray:440`** — hal. 0, chunk 440

> Occasionally, the brachiocephalic trunk has a small branch, the thyroid ima artery, which contributes to the vascular supply of the thyroid gland. The second branch The second branch of the arch of the aorta is the left common carotid artery (Fig. 3.90). It arises from the arch immediately to the left and slightly posterior to the brachiocephalic trunk and ascends through the superior mediastinum 

**[D] `medrag-anatomy_gray:2444`** — hal. 0, chunk 2444

> Two other small arteries also cross the base of the posterior triangle. These are the transverse cervical and the suprascapular arteries (Fig. 8.186). They are both branches of the thyrocervical trunk, which arises from the first part of the subclavian artery. After branching from the thyrocervical trunk, the transverse cervical artery passes laterally and slightly posteriorly across the base of t

**[E] `medrag-anatomy_gray:439`** — hal. 0, chunk 439

> Three branches arise from the superior border of the arch of the aorta; at their origins, all three are crossed anteriorly by the left brachiocephalic vein. The first branch Beginning on the right, the first branch of the arch of the aorta is the brachiocephalic trunk (Fig. 3.90). It is the largest of the three branches and, at its point of origin behind the manubrium of the sternum, is slightly a

**[F] `medrag-anatomy_gray:434`** — hal. 0, chunk 434

> Lymphatic drainage returns to multiple groups of nodes at one or more of the following locations: along the internal thoracic arteries (parasternal); at the tracheal bifurcation (tracheobronchial); and in the root of the neck. The left and right brachiocephalic veins are located immediately posterior to the thymus. They form on each side at the junction between the internal jugular and subclavian 

**[G] `medrag-anatomy_gray:2057`** — hal. 0, chunk 2057

> Cervical components of the brachial plexus pass directly from the neck through the axillary inlets to enter the upper limb. In the neck, the two important vertebral levels (Fig. 8.12) are: between CIII and CIV, at approximately the superior border of the thyroid cartilage of the larynx (which can be palpated) and where the major artery on each side of the neck (the common carotid artery) bifurcate

**[H] `medrag-anatomy_gray:2460`** — hal. 0, chunk 2460

> The superficial branch continues on the deep surface of the trapezius muscle. The deep branch continues on the deep surface of the rhomboid muscles near the medial border of the scapula. Suprascapular artery. The lowest branch of the thyrocervical trunk is the suprascapular artery (Fig. 8.191). This branch passes laterally, crossing anterior to the anterior scalene muscle, the phrenic nerve, the t

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## R-cardiovascular-026  (R/cardiovascular)

**QUERY:** How are the Anterior circumflex humeral artery and the Axillary vein anatomically related?

**MUST-HAVE:** anteriorcircumflexhumeralartery, axillaryvein

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:1945

**Teks kunci lama `medrag-anatomy_gray:1945`:**

> Fig. 7.48 Contents of the axilla: muscles. Long head of biceps brachiiShort head of biceps brachiiTendon of biceps brachiiCoracobrachialisBicipital aponeurosisTransverse humeral ligament Fig. 7.49 Contents of the axilla: the axillary artery. Lower border of teres majorPectoralis minorLateral margin of rib ISubclaviusSubclavian artery1st part2nd part3rd partBrachial arteryAxillary artery Fig. 7.50 

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:1762`** — hal. 0, chunk 1762

> This anterior circumflex humeral artery supplies branches to surrounding tissues, which include the glenohumeral joint and the head of the humerus. The posterior circumflex humeral artery originates from the lateral surface of the third part of the axillary artery immediately posterior to the origin of the anterior circumflex humeral artery (Fig. 7.50). With the axillary nerve, it leaves the axill

**[B] `medrag-anatomy_gray:1740`** — hal. 0, chunk 1740

> At the axillary inlet, the axillary vein is anterior to the axillary artery, which, in turn, is anterior to the trunks of the brachial plexus. The inferior trunk (lower trunk) of the brachial plexus lies directly on rib I in the neck, as does the subclavian artery and vein. As they pass over rib I, the vein and artery are separated by the insertion of the anterior scalene muscle (Fig. 7.40A). The 

**[C] `medrag-anatomy_gray:1737`** — hal. 0, chunk 1737

> The posterior circumflex humeral artery originates from the third part of the axillary artery in the axilla (Figs. 7.38 and 7.39). The posterior circumflex humeral artery and axillary nerve leave the axilla through the quadrangular space in the posterior wall and enter the posterior scapular region. The vessel supplies the related muscles and the glenohumeral joint. The circumflex scapular artery 

**[D] `medrag-anatomy_gray:1984`** — hal. 0, chunk 1984

> Anterior dislocation of the humeral head Anterior dislocation of the humeral head may compress the axillary artery, resulting in vessel occlusion. This is unlikely to render the upper limb completely ischemic, but it may be necessary to surgically reconstruct the axillary artery to obtain pain-free function. Importantly, the axillary artery is intimately related to the brachial plexus, which may b

**[E] `medrag-anatomy_gray:1761`** — hal. 0, chunk 1761

> The circumflex scapular artery passes through the triangular space between the subscapularis, teres major, and long head of the triceps muscle. Posteriorly, it passes inferior to, or pierces, the origin of the teres minor muscle to enter the infraspinous fossa. It anastomoses with the suprascapular artery and the deep branch (dorsal scapular artery) of the transverse cervical artery, thereby contr

**[F] `medrag-anatomy_gray:1763`** — hal. 0, chunk 1763

> The axillary vein begins at the lower margin of the teres major muscle and is the continuation of the basilic vein (Fig. 7.51), which is a superficial vein that drains the posteromedial surface of the hand and forearm and penetrates the deep fascia in the middle of the arm. The axillary vein passes through the axilla medial and anterior to the axillary artery and becomes the subclavian vein as the

**[G] `medrag-anatomy_gray:1753`** — hal. 0, chunk 1753

> The circumflex scapular artery and vein pass into this space. This triangular interval is formed by: the lateral margin of the long head of the triceps brachii muscle, the shaft of the humerus, and the inferior margin of the teres major muscle (Fig. 7.45). The radial nerve passes out of the axilla traveling through this interval to reach the posterior compartment of the arm. The floor of the axill

**[H] `medrag-anatomy_gray:1758`** — hal. 0, chunk 1758

> The second part is posterior to the pectoralis minor. The third part is distal to the pectoralis minor. Generally, six branches arise from the axillary artery: One branch, the superior thoracic artery, originates from the first part. Two branches, the thoraco-acromial artery and the lateral thoracic artery, originate from the second part. Three branches, the subscapular artery, the anterior circum

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## R-cardiovascular-033  (R/cardiovascular)

**QUERY:** How are the Superior thyroid vein and the Thyrocervical trunk anatomically related?

**MUST-HAVE:** superiorthyroidvein, thyrocervicaltrunk

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:2537

**Teks kunci lama `medrag-anatomy_gray:2537`:**

> The major blood supply to the larynx is by the superior and inferior laryngeal arteries (Fig. 8.226): The superior laryngeal artery originates near the upper margin of the thyroid cartilage from the superior thyroid branch of the external carotid artery, and accompanies the internal branch of the superior laryngeal nerve through the thyrohyoid membrane to reach the larynx. The inferior laryngeal a

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:434`** — hal. 0, chunk 434

> Lymphatic drainage returns to multiple groups of nodes at one or more of the following locations: along the internal thoracic arteries (parasternal); at the tracheal bifurcation (tracheobronchial); and in the root of the neck. The left and right brachiocephalic veins are located immediately posterior to the thymus. They form on each side at the junction between the internal jugular and subclavian 

**[B] `medrag-anatomy_gray:2446`** — hal. 0, chunk 2446

> Veins accompany all the arteries described previously. The subclavian vein is a continuation of the axillary vein and begins at the lateral border of rib I. As it crosses the base of the posterior triangle, the external jugular, and, possibly, the suprascapular and transverse cervical veins enter it (Fig. 8.185). It ends by joining with the internal jugular vein to form the brachiocephalic vein ne

**[C] `medrag-anatomy_gray:2458`** — hal. 0, chunk 2458

> Inferior thyroid artery. The inferior thyroid artery (Fig. 8.191) is the superior continuation of the thyrocervical trunk. It ascends, anterior to the anterior scalene muscle, and eventually turns medially, crossing posterior to the carotid sheath and its contents and anterior to the vertebral artery. Reaching the posterior surface of the thyroid gland it supplies the thyroid gland. When the infer

**[D] `medrag-anatomy_gray:2459`** — hal. 0, chunk 2459

> Transverse cervical artery. The middle branch of the thyrocervical trunk is the transverse cervical artery (Fig. 8.191). This branch passes laterally, across the anterior surface of the anterior scalene muscle and the phrenic nerve, and enters and crosses the base of the posterior triangle of the neck. It continues to the deep surface of the trapezius muscle, where it divides into superficial and 

**[E] `medrag-anatomy_gray:2435`** — hal. 0, chunk 2435

> Occasionally, a small thyroid ima artery arises from the brachiocephalic trunk or the arch of the aorta and ascends on the anterior surface of the trachea to supply the thyroid gland. Three veins drain the thyroid gland (Fig. 8.179): The superior thyroid vein primarily drains the area supplied by the superior thyroid artery. The middle and inferior thyroid veins drain the rest of the thyroid gland

**[F] `medrag-anatomy_gray:2434`** — hal. 0, chunk 2434

> The posterior glandular branch passes to the posterior side of the gland and may anastomose with the inferior thyroid artery (Fig. 8.180). Inferior thyroid artery. The inferior thyroid artery is a branch of the thyrocervical trunk, which arises from the first part of the subclavian artery (Figs. 8.179 and 8.180). It ascends along the medial edge of the anterior scalene muscle, passes posteriorly t

**[G] `medrag-anatomy_gray:2422`** — hal. 0, chunk 2422

> The internal jugular vein traverses the neck within the carotid sheath, initially posterior to the internal carotid artery, but passes to a more lateral position farther down. It remains lateral to the common carotid artery through the rest of the neck with the vagus nerve [X] posterior and partially between the two vessels. The paired internal jugular veins join with the subclavian veins posterio

**[H] `medrag-anatomy_gray:2444`** — hal. 0, chunk 2444

> Two other small arteries also cross the base of the posterior triangle. These are the transverse cervical and the suprascapular arteries (Fig. 8.186). They are both branches of the thyrocervical trunk, which arises from the first part of the subclavian artery. After branching from the thyrocervical trunk, the transverse cervical artery passes laterally and slightly posteriorly across the base of t

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## R-cardiovascular-043  (R/cardiovascular)

**QUERY:** How are the Middle meningeal artery and the Superior petrosal sinus anatomically related?

**MUST-HAVE:** middlemeningealartery, superiorpetrosalsinus

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:2295

**Teks kunci lama `medrag-anatomy_gray:2295`:**

> Contraction of the stapedius muscle, usually in response to loud noises, pulls the stapes posteriorly and prevents excessive oscillation. Numerous arteries supply the structures in the middle ear: the two largest branches are the tympanic branch of the maxillary artery and the mastoid branch of the occipital or posterior auricular arteries; smaller branches come from the middle meningeal artery, t

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:2136`** — hal. 0, chunk 2136

> The paired cavernous sinuses are against the lateral aspect of the body of the sphenoid bone on either side of the sella turcica (Figs. 8.45 and 8.46). They are of great clinical importance because of their connections and the structures that pass through them. The cavernous sinuses receive blood not only from cerebral veins but also from the ophthalmic veins (from the orbit) and emissary veins (f

**[B] `medrag-anatomy_gray:2363`** — hal. 0, chunk 2363

> The second part of the maxillary artery (the part related to the lateral pterygoid muscle) gives origin to deep temporal, masseteric, buccal, and pterygoid branches, which course with branches of the mandibular nerve [V3]. The third part of the maxillary artery is in the pterygopalatine fossa (see Fig. 8.158) The middle meningeal artery ascends vertically from the maxillary artery and passes throu

**[C] `medrag-anatomy_gray:2138`** — hal. 0, chunk 2138

> The superior petrosal sinuses drain the cavernous sinuses into the transverse sinuses. Each superior petrosal sinus begins at the posterior end of the cavernous sinus, passes posterolaterally along the superior margin of the petrous part of each temporal bone, and connects to the transverse sinus (Fig. 8.44). The superior petrosal sinuses also receive cerebral and cerebellar veins. The inferior pe

**[D] `medrag-anatomy_gray:2118`** — hal. 0, chunk 2118

> The anterior meningeal arteries are branches of the ethmoidal arteries. The middle meningeal artery is a branch of the maxillary artery. It enters the middle cranial fossa through the foramen spinosum and divides into anterior and posterior branches: The anterior branch passes in an almost vertical direction to reach the vertex of the skull, crossing the pterion during its course. The posterior br

**[E] `medrag-anatomy_gray:2694`** — hal. 0, chunk 2694

> Fig. 8.43 Dural venous sinuses. Fig. 8.44 Veins, meninges, and dural venous sinuses. Sigmoid sinusInferior sagittal sinusSuperior petrosal sinusBasilar sinusSphenoparietal sinusIntercavernous sinusCavernous sinusOphthalmic veinPterygoid plexus of veinsSuperior petrosal sinusSigmoid sinusInferior petrosal sinusRight transverse sinusGreat cerebral veinConfluence of sinusesStraight sinusSuperior sagi

**[F] `medrag-anatomy_gray:2364`** — hal. 0, chunk 2364

> The middle meningeal artery is the largest of the meningeal vessels and supplies much of the dura mater, bone, and related bone marrow of the cranial cavity walls. Within the cranial cavity, the middle meningeal artery and its branches travel in the periosteal (outer) layer of dura mater, which is tightly adherent to the bony walls. As major branches of the middle meningeal artery pass superiorly 

**[G] `medrag-anatomy_gray:2722`** — hal. 0, chunk 2722

> Fig. 8.151 Maxillary artery. Branches of middlemeningeal in cranial cavityMiddle meningeal arteryArtery to masseterUpper head oflateral pterygoid (cut )Pterygoid arteryPterygopalatine fossaLower head of lateralpterygoid (cut )Buccal arteryMental arteryInferior alveolar arteryExternal carotidMaxillary arteryAuriculotemporal nerveSuperficial temporal arteryDeep temporal arteries Fig. 8.152 Pterygoid

**[H] `medrag-anatomy_gray:2137`** — hal. 0, chunk 2137

> Structures passing through each cavernous sinus are: the internal carotid artery, and the abducent nerve [VI]. Structures in the lateral wall of each cavernous sinus are, from superior to inferior: the oculomotor nerve [III], the trochlear nerve [IV], the ophthalmic nerve [V1], and the maxillary nerve [V2]. Connecting the right and left cavernous sinuses are the intercavernous sinuses on the anter

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## R-joints-001  (R/joints)

**QUERY:** How are the Pubic symphysis and the Sacrotuberous ligament anatomically related?

**MUST-HAVE:** pubicsymphysis, sacrotuberousligament

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:995, medrag-anatomy_gray:1171, medrag-anatomy_gray:1169

**Teks kunci lama `medrag-anatomy_gray:995`:**

> The diamond-shaped pelvic outlet is formed by both bone and ligaments (Fig. 5.6). It is limited anteriorly in the midline by the pubic symphysis. On each side, the inferior margin of the pelvic bone projects posteriorly and laterally from the pubic symphysis to end in a prominent tuberosity, the ischial tuberosity. Together, these elements construct the pubic arch, which forms the margin of the an

**Teks kunci lama `medrag-anatomy_gray:1171`:**

> Fig. 5.22 Sacrum and coccyx. A. Anterior view. B. Posterior view. C. Lateral view. Fig. 5.23 Lumbosacral joints and associated ligaments. A. Lateral view. B. Anterior view. Fig. 5.24 Sacro-iliac joints and associated ligaments. A. Lateral view. B. Anterior view. C. Posterior view. Fig. 5.25 Pubic symphysis and associated ligaments. Fig. 5.26 Orientation of the pelvis (anatomical position). Fig. 5.

**Teks kunci lama `medrag-anatomy_gray:1169`:**

> Fig. 5.10 Areas of communication between the true pelvis and other regions. A. Between the true pelvis, abdomen, and lower limb. B. Between the perineum and other regions. Gap between pubic symphysis and perineal membrane• Dorsal vein of penis and clitorisSacrotuberous ligamentSacrospinous ligamentOrifices in floor• Urethra• Vagina• AnusLesser sciatic foramen• Obturator internus muscle• Pudendal n

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:1028`** — hal. 0, chunk 1028

> These ligaments stabilize the sacrum on the pelvic bones by resisting the upward tilting of the inferior aspect of the sacrum (Fig. 5.29B). They also convert the greater and lesser sciatic notches of the pelvic bone into foramina (Fig. 5.29A,B). The greater sciatic foramen lies superior to the sacrospinous ligament and the ischial spine. The lesser sciatic foramen lies inferior to the ischial spin

**[B] `medrag-anatomy_gray:1270`** — hal. 0, chunk 1270

> Finding the dorsalis pedis artery 665 Approximating the position of the plantar arterial arch 665 The lower limb is directly anchored to the axial skeleton by a sacroiliac joint and by strong ligaments, which link the pelvic bone to the sacrum. It is separated from the abdomen, back, and perineum by a continuous line (Fig. 6.1), which: joins the pubic tubercle with the anterior superior iliac spin

**[C] `medrag-anatomy_gray:1023`** — hal. 0, chunk 1023

> Each sacro-iliac joint is stabilized by three ligaments: the anterior sacro-iliac ligament, which is a thickening of the fibrous membrane of the joint capsule and runs anteriorly and inferiorly to the joint (Fig. 5.24B); the interosseous sacro-iliac ligament, which is the largest, strongest ligament of the three, and is positioned immediately posterosuperior to the joint and attaches to adjacent e

**[D] `medrag-anatomy_gray:995`** — hal. 0, chunk 995

> The diamond-shaped pelvic outlet is formed by both bone and ligaments (Fig. 5.6). It is limited anteriorly in the midline by the pubic symphysis. On each side, the inferior margin of the pelvic bone projects posteriorly and laterally from the pubic symphysis to end in a prominent tuberosity, the ischial tuberosity. Together, these elements construct the pubic arch, which forms the margin of the an

**[E] `medrag-anatomy_gray:1024`** — hal. 0, chunk 1024

> The pubic symphysis lies anteriorly between the adjacent surfaces of the pubic bones (Fig. 5.25). Each of the joint’s surfaces is covered by hyaline cartilage and is linked across the midline to adjacent surfaces by fibrocartilage. The joint is surrounded by interwoven layers of collagen fibers and the two major ligaments associated with it are: the superior pubic ligament, located above the joint

**[F] `medrag-anatomy_gray:1171`** — hal. 0, chunk 1171

> Fig. 5.22 Sacrum and coccyx. A. Anterior view. B. Posterior view. C. Lateral view. Fig. 5.23 Lumbosacral joints and associated ligaments. A. Lateral view. B. Anterior view. Fig. 5.24 Sacro-iliac joints and associated ligaments. A. Lateral view. B. Anterior view. C. Posterior view. Fig. 5.25 Pubic symphysis and associated ligaments. Fig. 5.26 Orientation of the pelvis (anatomical position). Fig. 5.

**[G] `medrag-anatomy_gray:1172`** — hal. 0, chunk 1172

> Fig. 5.29 Sacrospinous and sacrotuberous ligaments. A. Medial view of right side of pelvis. B. Function of the ligaments. Fig. 5.30 Obturator internus and piriformis muscles (medial view of right side of pelvis). Fig. 5.31 Apertures in the pelvic wall. Obturator canal – obturator nerve and vesselsObturator internus muscleGreater sciatic foramen,above and belowpiriformis muscleLesser sciatic forame

**[H] `medrag-anatomy_gray:1027`** — hal. 0, chunk 1027

> The walls of the pelvic cavity consist of the sacrum, the coccyx, the pelvic bones inferior to the linea terminalis, two ligaments, and two muscles. Ligaments of the pelvic wall The sacrospinous and sacrotuberous ligaments (Fig. 5.29A) are major components of the lateral pelvic walls that help define the apertures between the pelvic cavity and adjacent regions through which structures pass. The sm

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## R-muscular-001  (R/muscular)

**QUERY:** How are the Adductor brevis and the Vastus lateralis muscle anatomically related?

**MUST-HAVE:** adductorbrevis, vastuslateralismuscle

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:1572, medrag-anatomy_gray:1571

**Teks kunci lama `medrag-anatomy_gray:1572`:**

> Fig. 6.67 Obturator artery. Ligament ofhead offemurObturatorarteryAnterior branchAcetabular branchPosterior branchObturatorexternus muscleArtery of ligament of head of femur Fig. 6.68 Femoral nerve. Nerve to pectineusAnterior branchNerves to iliacusNerve to sartoriusRectus femoris muscleVastus lateralis muscleVastus medialis muscleSaphenous nerveSaphenous nervePes anserinusSartorius muscleGracilis

**Teks kunci lama `medrag-anatomy_gray:1571`:**

> Fig. 6.66 Deep artery of thigh. A. Anterior view. B. Posterior view. BSuperior gluteal arteryLateral femoral circumflex arteryCruciate anastomosesMedial circumflex femoral arteryFirst perforating arterySecond perforating arteryThird perforating arteryTerminal end of deepartery of thighPopliteal arteryAdductor magnus muscleAdductor hiatusInferior gluteal arteryPiriformis muscleAPsoas and iliacus mu

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:1378`** — hal. 0, chunk 1378

> The vastus medialis originates from a continuous line of attachment on the femur, which begins anteromedially on the intertrochanteric line and continues posteroinferiorly along the pectineal line and then descends along the medial lip of the linea aspera and onto the medial supracondylar line. The fibers converge onto the medial aspect of the quadriceps femoris tendon and the medial border of the

**[B] `medrag-anatomy_gray:1387`** — hal. 0, chunk 1387

> On the pelvis, the adductor magnus is attached along a line that extends from the inferior pubic ramus, above the attachments of the adductor longus and brevis muscles, and along the ramus of the ischium to the ischial tuberosity. The part of the muscle that originates from the ischiopubic ramus expands laterally and inferiorly to insert on the femur along a vertical line of attachment that extend

**[C] `medrag-anatomy_gray:1388`** — hal. 0, chunk 1388

> The medial part of the adductor magnus, often called the “hamstring part,” originates from the ischial tuberosity of the pelvic bone and descends almost vertically along the thigh to insert via a rounded tendon into the adductor tubercle on the medial condyle of the distal head of the femur. It also inserts via an aponeurosis up onto the medial supracondylar line. A large circular gap inferiorly b

**[D] `medrag-anatomy_gray:1375`** — hal. 0, chunk 1375

> The medial compartment of the thigh contains six muscles (gracilis, pectineus, adductor longus, adductor brevis, adductor magnus, and obturator externus). All except the pectineus, which is innervated by the femoral nerve, and part of the adductor magnus, which is innervated by the sciatic nerve, are innervated by the obturator nerve. The posterior compartment of the thigh contains three large mus

**[E] `medrag-anatomy_gray:1385`** — hal. 0, chunk 1385

> The adductor longus contributes to the floor of the femoral triangle, and its medial margin forms the medial border of the femoral triangle. The muscle also forms the proximal posterior wall of the adductor canal. The adductor longus adducts and medially rotates the thigh at the hip joint and is innervated by the anterior division of the obturator nerve. The adductor brevis lies posterior to the p

**[F] `medrag-anatomy_gray:1379`** — hal. 0, chunk 1379

> A tiny muscle (articularis genus) originates from the femur just inferior to the origin of the vastus intermedius and inserts into the suprapatellar bursa associated with the knee joint (Fig. 6.59). This articular muscle, which is often part of the vastus intermedius muscle, pulls the bursa away from the knee joint during extension. The vastus lateralis is the largest of the vastus muscles (Fig. 6

**[G] `medrag-anatomy_gray:1568`** — hal. 0, chunk 1568

> Fig. 6.60 Muscles of the medial compartment of thigh. Anterior view. Obturator externusAdductor magnusPectineusAdductor longusAdductor brevisAnterior compartment of thighSartorius attachmentGracilisGracilisSemitendinosus attachmentAdductor hiatusAdductor canalAdductor longusAdductor magnusPosterior compartment of thighPes anserinus Fig. 6.61 Pectineus, adductor longus, and adductor brevis muscles.

**[H] `medrag-anatomy_gray:1386`** — hal. 0, chunk 1386

> The adductor brevis adducts and medially rotates the thigh at the hip joint and is innervated by the obturator nerve. The adductor magnus is the largest and deepest of the muscles in the medial compartment of the thigh (Fig. 6.62). The muscle forms the distal posterior wall of the adductor canal. Like the adductor longus and brevis muscles, the adductor magnus is a triangular or fan-shaped muscle 

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## R-muscular-003  (R/muscular)

**QUERY:** How are the Extensor hallucis longus and the Flexor digitorum brevis anatomically related?

**MUST-HAVE:** extensorhallucislongus, flexordigitorumbrevis

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:1521

**Teks kunci lama `medrag-anatomy_gray:1521`:**

> Near the base of metatarsal I, the medial plantar artery gives rise to a superficial branch, which divides into three vessels that pass superficial to the flexor digitorum brevis muscle to join the plantar metatarsal arteries from the deep plantar arch. The dorsalis pedis artery is the continuation of the anterior tibial artery and begins as the anterior tibial artery crosses the ankle joint (Fig.

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:1505`** — hal. 0, chunk 1505

> On the dorsal aspect The extensor digitorum brevis is attached to a roughened area on the superolateral surface of the calcaneus lateral to the tarsal sinus (Fig. 6.118 and Table 6.10). The flat muscle belly passes anteromedially over the foot, deep to the tendons of the extensor digitorum longus, and forms three tendons, which enter digits II, III, and IV. The tendons join the lateral sides of th

**[B] `medrag-anatomy_gray:1507`** — hal. 0, chunk 1507

> The abductor hallucis abducts and flexes the great toe at the metatarsophalangeal joint and is innervated by the medial plantar branch of the tibial nerve. The flexor digitorum brevis muscle lies immediately superior to the plantar aponeurosis and inferior to the tendons of the flexor digitorum longus in the sole of the foot (Fig. 6.119). The flat spindle-shaped muscle belly originates as a tendon

**[C] `medrag-anatomy_gray:1511`** — hal. 0, chunk 1511

> The lumbrical muscles act through the extensor hoods to resist excessive extension of the metatarsophalangeal joints and flexion of the interphalangeal joints when the heel leaves the ground during walking. The first lumbrical is innervated by the medial plantar nerve, while the other three are innervated by the lateral plantar nerve. There are three muscles in the third layer in the sole of the f

**[D] `medrag-anatomy_gray:1514`** — hal. 0, chunk 1514

> The adductor hallucis adducts the great toe at the metatarsophalangeal joint and is innervated by the lateral plantar nerve. The flexor digiti minimi brevis muscle originates from the plantar surface of the base of metatarsal V and adjacent sheath of the fibularis longus tendon (Fig. 6.122). It inserts on the lateral side of the base of the proximal phalanx of the little toe. The flexor digiti min

**[E] `medrag-anatomy_gray:1445`** — hal. 0, chunk 1445

> The flexor digitorum longus muscle originates on the medial side of the posterior compartment of the leg and inserts into the lateral four digits of the foot (Fig. 6.88). It arises mainly from the medial side of the posterior surface of the tibia inferior to the soleal line. The flexor digitorum longus descends in the leg and forms a tendon, which crosses posterior to the tendon of the tibialis po

**[F] `medrag-anatomy_gray:1446`** — hal. 0, chunk 1446

> The flexor digitorum longus flexes the lateral four toes. It is involved with gripping the ground during walking and propelling the body forward off the toes at the end of the stance phase of gait. It is innervated by the tibial nerve. The tibialis posterior muscle originates from the interosseous membrane and the adjacent posterior surfaces of the tibia and fibula (Fig. 6.88). It lies between and

**[G] `medrag-anatomy_gray:1463`** — hal. 0, chunk 1463

> The extensor digitorum longus muscle is the most posterior and lateral of the muscles in the anterior compartment of the leg (Fig. 6.93). It originates mainly from the upper one-half of the medial surface of the fibula lateral to and above the origin of the extensor hallucis longus muscle, and extends superiorly onto the lateral condyle of the tibia. Like the tibialis anterior muscle, it also orig

**[H] `medrag-anatomy_gray:1462`** — hal. 0, chunk 1462

> The tendon of the extensor hallucis longus appears between the tendons of the tibialis anterior and extensor digitorum longus in the lower one-half of the leg and descends into the foot. It continues anteriorly on the medial side of the dorsal surface of the foot to near the end of the great toe where it inserts on the upper surface of the base of the distal phalanx. The extensor hallucis longus e

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## R-muscular-009  (R/muscular)

**QUERY:** How are the Extensor indicis and the Supraspinatus muscle anatomically related?

**MUST-HAVE:** extensorindicis, supraspinatusmuscle

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:2034

**Teks kunci lama `medrag-anatomy_gray:2034`:**

> Extension of the index, middle, ring, and little fingers is performed by the extensor digitorum muscle. Placing the fist in a palm-down position on the table and pressing the middle phalanges onto the table effectively immobilizes the action of the extensor digitorum. The freshman was therefore unable to elevate his middle finger (which was sticking out). It is important to remember that if this s

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:1978`** — hal. 0, chunk 1978

> In the clinic The two main disorders of the rotator cuff are impingement and tendinopathy. The muscle most commonly involved is supraspinatus as it passes beneath the acromion and the acromioclavicular ligament. This space, beneath which the supraspinatus tendon passes, is of fixed dimensions. Swelling of the supraspinatus muscle, excessive fluid within the subacromial/subdeltoid bursa, or subacro

**[B] `medrag-anatomy_gray:1729`** — hal. 0, chunk 1729

> The supraspinatus participates in abduction of the arm. The infraspinatus laterally rotates the humerus. The teres minor muscle is a cord-like muscle that originates from a flattened area of the scapula immediately adjacent to its lateral border below the infraglenoid tubercle (Fig. 7.37). Its tendon inserts on the inferior facet of the greater tubercle of the humerus. The teres minor laterally ro

**[C] `medrag-anatomy_gray:1860`** — hal. 0, chunk 1860

> The extensor pollicis longus extends all joints of the thumb (Table 7.14). The extensor indicis muscle is an accessory extensor of the index finger. It originates distal to the extensor pollicis longus from the posterior surface of the ulna and adjacent interosseous membrane (Fig. 7.91). The tendon passes into the hand and inserts into the extensor hood of the index finger with the tendon of the e

**[D] `medrag-anatomy_gray:1728`** — hal. 0, chunk 1728

> The supraspinatus, infraspinatus, and teres minor muscles are components of the rotator cuff, which stabilizes the glenohumeral joint. The supraspinatus and infraspinatus muscles originate from two large fossae, one above and one below the spine, on the posterior surface of the scapula (Fig. 7.37). They form tendons that insert on the greater tubercle of the humerus. The tendon of the supraspinatu

**[E] `medrag-anatomy_gray:1708`** — hal. 0, chunk 1708

> The superior facet is for attachment of the supraspinatus muscle. The middle facet is for attachment of the infraspinatus. The inferior facet is for attachment of the teres minor. The lesser tubercle is anterior in position and its surface is marked by a large smooth impression for attachment of the subscapularis muscle. A deep intertubercular sulcus (bicipital groove) separates the lesser and gre

**[F] `medrag-anatomy_gray:2025`** — hal. 0, chunk 2025

> The supraspinatus and infraspinatus muscles are supplied by the suprascapular nerve (C5, C6), which originates from the superior trunk of the brachial plexus. Given that only these muscles were involved, it is highly likely that the muscle atrophy is caused by denervation. Denervation may result from a direct nerve transection, nerve compression, or a pharmacological effect on the nerve. The typic

**[G] `medrag-anatomy_gray:1856`** — hal. 0, chunk 1856

> The supinator muscle has two layers, which insert together on the proximal aspect of the radius (Fig. 7.91): The more superficial (humeral) layer originates mainly from the lateral epicondyle of the humerus and the related anular ligament and the radial collateral ligament of the elbow joint. The deep (ulnar) layer originates mainly from the supinator crest on the posterolateral surface of the uln

**[H] `medrag-anatomy_gray:165`** — hal. 0, chunk 165

> Interspinous ligaments pass between adjacent vertebral spinous processes (Fig. 2.38). They attach from the base to the apex of each spinous process and blend with the supraspinous ligament posteriorly and the ligamenta flava anteriorly on each side. Muscles of the back are organized into superficial, intermediate, and deep groups. Muscles in the superficial and intermediate groups are extrinsic mu

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## R-muscular-012  (R/muscular)

**QUERY:** How are the Calcaneal tendon and the Extensor hallucis longus anatomically related?

**MUST-HAVE:** calcanealtendon, extensorhallucislongus

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:1582

**Teks kunci lama `medrag-anatomy_gray:1582`:**

> Fig. 6.93 Muscles of the anterior compartment of leg. Anterior surfaceof fibulaExtensordigitorumlongusOrigin of extensordigitorum longusLateral surfaceof fibulaExtensor hallucis longusOrigin of extensorhallucis longusFibularistertiusAttachment to inferior surface of medial cuneiform and metatarsal ISubcutaneoussurface of tibiaTibialisanteriorOrigin of tibialisanterior Fig. 6.94 Anterior tibial art

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:1513`** — hal. 0, chunk 1513

> The transverse head originates from the plantar ligaments associated with the metatarsophalangeal joints of the lateral three toes and from the associated deep transverse metatarsal ligaments—the muscle crosses the sole of the foot transversely from lateral to medial and joins the oblique head near the base of the great toe. The oblique head is larger than the transverse head and originates from t

**[B] `medrag-anatomy_gray:1462`** — hal. 0, chunk 1462

> The tendon of the extensor hallucis longus appears between the tendons of the tibialis anterior and extensor digitorum longus in the lower one-half of the leg and descends into the foot. It continues anteriorly on the medial side of the dorsal surface of the foot to near the end of the great toe where it inserts on the upper surface of the base of the distal phalanx. The extensor hallucis longus e

**[C] `medrag-anatomy_gray:1512`** — hal. 0, chunk 1512

> The medial head originates from the tendon of the tibialis posterior muscle as it passes into the sole of the foot. The medial and lateral heads unite and give rise to a muscle belly, which itself is separated into medial and lateral parts adjacent to the plantar surface of metatarsal I. Each part of the muscle gives rise to a tendon that inserts on either the lateral or medial side of the base of

**[D] `medrag-anatomy_gray:1505`** — hal. 0, chunk 1505

> On the dorsal aspect The extensor digitorum brevis is attached to a roughened area on the superolateral surface of the calcaneus lateral to the tarsal sinus (Fig. 6.118 and Table 6.10). The flat muscle belly passes anteromedially over the foot, deep to the tendons of the extensor digitorum longus, and forms three tendons, which enter digits II, III, and IV. The tendons join the lateral sides of th

**[E] `medrag-anatomy_gray:1476`** — hal. 0, chunk 1476

> The underside of the sustentaculum tali has a distinct groove running from posterior to anterior and along which the tendon of the flexor hallucis longus muscle travels into the sole of the foot. The superior surface of the sustentaculum tali has a facet (middle talar articular surface) for articulation with the corresponding middle facet on the head of the talus. Anterior and posterior talar arti

**[F] `medrag-anatomy_gray:1444`** — hal. 0, chunk 1444

> The muscle fibers of the flexor hallucis longus converge inferiorly to form a large cord-like tendon, which passes behind the distal head of the tibia and then slips into a distinct groove on the posterior surface of the adjacent tarsal bone (talus) of the foot. The tendon curves anteriorly first under the talus and then under a shelf of bone (the sustentaculum tali), which projects medially from 

**[G] `medrag-anatomy_gray:1474`** — hal. 0, chunk 1474

> The upper part is separated from the calcaneal tendon by a bursa. The lower part curves forward, is covered by subcutaneous tissue, is the weight-bearing region of the heel, and is continuous onto the plantar surface of the bone as the calcaneal tuberosity. The calcaneal tuberosity projects forward on the plantar surface as a large medial process and a small lateral process separated from each oth

**[H] `medrag-anatomy_gray:1473`** — hal. 0, chunk 1473

> The inferior surface of the body of the talus has a large oval concave facet (the posterior calcaneal articular facet) for articulation with the calcaneus. The posterior aspect of the body of the talus consists of a backward and medially facing projection (the posterior process). The posterior process is marked on its surface by a lateral tubercle and a medial tubercle, which bracket between them 

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## R-muscular-014  (R/muscular)

**QUERY:** How are the Adductor brevis and the Vastus intermedius muscle anatomically related?

**MUST-HAVE:** adductorbrevis, vastusintermediusmuscle

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:1571

**Teks kunci lama `medrag-anatomy_gray:1571`:**

> Fig. 6.66 Deep artery of thigh. A. Anterior view. B. Posterior view. BSuperior gluteal arteryLateral femoral circumflex arteryCruciate anastomosesMedial circumflex femoral arteryFirst perforating arterySecond perforating arteryThird perforating arteryTerminal end of deepartery of thighPopliteal arteryAdductor magnus muscleAdductor hiatusInferior gluteal arteryPiriformis muscleAPsoas and iliacus mu

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:1388`** — hal. 0, chunk 1388

> The medial part of the adductor magnus, often called the “hamstring part,” originates from the ischial tuberosity of the pelvic bone and descends almost vertically along the thigh to insert via a rounded tendon into the adductor tubercle on the medial condyle of the distal head of the femur. It also inserts via an aponeurosis up onto the medial supracondylar line. A large circular gap inferiorly b

**[B] `medrag-anatomy_gray:1379`** — hal. 0, chunk 1379

> A tiny muscle (articularis genus) originates from the femur just inferior to the origin of the vastus intermedius and inserts into the suprapatellar bursa associated with the knee joint (Fig. 6.59). This articular muscle, which is often part of the vastus intermedius muscle, pulls the bursa away from the knee joint during extension. The vastus lateralis is the largest of the vastus muscles (Fig. 6

**[C] `medrag-anatomy_gray:1400`** — hal. 0, chunk 1400

> The three perforating arteries branch from the deep artery of the thigh (Fig. 6.66) as it descends anterior to the adductor brevis muscle—the first originates above the muscle, the second originates anterior to the muscle, and the third originates below the muscle. All three penetrate through the adductor magnus near its attachment to the linea aspera to enter and supply the posterior compartment 

**[D] `medrag-anatomy_gray:1568`** — hal. 0, chunk 1568

> Fig. 6.60 Muscles of the medial compartment of thigh. Anterior view. Obturator externusAdductor magnusPectineusAdductor longusAdductor brevisAnterior compartment of thighSartorius attachmentGracilisGracilisSemitendinosus attachmentAdductor hiatusAdductor canalAdductor longusAdductor magnusPosterior compartment of thighPes anserinus Fig. 6.61 Pectineus, adductor longus, and adductor brevis muscles.

**[E] `medrag-anatomy_gray:1385`** — hal. 0, chunk 1385

> The adductor longus contributes to the floor of the femoral triangle, and its medial margin forms the medial border of the femoral triangle. The muscle also forms the proximal posterior wall of the adductor canal. The adductor longus adducts and medially rotates the thigh at the hip joint and is innervated by the anterior division of the obturator nerve. The adductor brevis lies posterior to the p

**[F] `medrag-anatomy_gray:1378`** — hal. 0, chunk 1378

> The vastus medialis originates from a continuous line of attachment on the femur, which begins anteromedially on the intertrochanteric line and continues posteroinferiorly along the pectineal line and then descends along the medial lip of the linea aspera and onto the medial supracondylar line. The fibers converge onto the medial aspect of the quadriceps femoris tendon and the medial border of the

**[G] `medrag-anatomy_gray:1386`** — hal. 0, chunk 1386

> The adductor brevis adducts and medially rotates the thigh at the hip joint and is innervated by the obturator nerve. The adductor magnus is the largest and deepest of the muscles in the medial compartment of the thigh (Fig. 6.62). The muscle forms the distal posterior wall of the adductor canal. Like the adductor longus and brevis muscles, the adductor magnus is a triangular or fan-shaped muscle 

**[H] `medrag-anatomy_gray:1387`** — hal. 0, chunk 1387

> On the pelvis, the adductor magnus is attached along a line that extends from the inferior pubic ramus, above the attachments of the adductor longus and brevis muscles, and along the ramus of the ischium to the ischial tuberosity. The part of the muscle that originates from the ischiopubic ramus expands laterally and inferiorly to insert on the femur along a vertical line of attachment that extend

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## R-nervous-009  (R/nervous)

**QUERY:** How are the Lacrimal gland and the Medulla oblongata anatomically related?

**MUST-HAVE:** lacrimalgland, medullaoblongata

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:2149

**Teks kunci lama `medrag-anatomy_gray:2149`:**

> The facial nerve [VII] carries GSA, SA, GVE, and BE fibers: The GSA fibers provide sensory input from part of the external acoustic meatus and deeper parts of the auricle. The SA fibers are for taste from the anterior two-thirds of the tongue. The GVE fibers are part of the parasympathetic part of the autonomic division of the PNS and stimulate secretomotor activity in the lacrimal gland, submandi

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:2219`** — hal. 0, chunk 2219

> Numerous ducts empty the glandular secretions into the lateral part of the superior fornix of the conjunctiva. Fluid is continually being secreted by the lacrimal gland and moved across the surface of the eyeball from lateral to medial as the eyelids blink. The fluid accumulates medially in the lacrimal lake and is drained from the lake by the lacrimal canaliculi, one canaliculus associated with e

**[B] `medrag-anatomy_gray:2222`** — hal. 0, chunk 2222

> Sympathetic innervation of the lacrimal gland follows a similar path as parasympathetic innervation. Postganglionic sympathetic fibers originating in the superior cervical ganglion travel along the plexus surrounding the internal carotid artery (Fig. 8.87). They leave this plexus as the deep petrosal nerve and join the parasympathetic fibers in the nerve of the pterygoid canal. Passing through the

**[C] `medrag-anatomy_gray:2387`** — hal. 0, chunk 2387

> Innervation of the lacrimal gland Approximately midway along the orbital wall, the postganglionic parasympathetic and sympathetic fibers leave the zygomaticotemporal branch of the zygomatic nerve and form a special autonomic nerve, which travels up the lateral orbital wall to join the lacrimal nerve (Fig. 8.157; also see Fig. 8.87). The lacrimal nerve is a major general sensory branch of the ophth

**[D] `medrag-anatomy_gray:2218`** — hal. 0, chunk 2218

> Loss of innervation of the levator palpebrae superioris by the oculomotor nerve causes an inability to open the superior eyelid voluntarily, producing a complete ptosis. Loss of innervation of the superior tarsal muscle by sympathetic fibers causes a constant partial ptosis. The lacrimal apparatus is involved in the production, movement, and drainage of fluid from the surface of the eyeball. It is

**[E] `medrag-anatomy_gray:2702`** — hal. 0, chunk 2702

> MedialPunctaLacrimal sacNasolacrimal ductLacrimalcanaliculiLacrimal glandTendon of levator palpebrae superioris muscle Fig. 8.84 Lacrimal gland and levator palpebrae superioris. Orbital part of lacrimal glandLacrimal vessels and nervePalpebral part oflacrimal glandTendon oflevator palpebrae superiorisOrbital septum Fig. 8.85 The lacrimal sac. Fig. 8.86 Position of lacrimal sac. Medial palpebral li

**[F] `medrag-anatomy_gray:2920`** — hal. 0, chunk 2920

> The medulla is the longest portion of the brainstem, measuring approximately 3 cm in length (eFig. 9.32A). At the rostral connection of the medulla to the pons, it has a broad conical shape that tapers caudally before connecting with the spinal cord at the level of the foramen magnum. Along the midline of the anterior surface is the anterior median fissure, which continues on to the anterior surfa

**[G] `medrag-anatomy_gray:2220`** — hal. 0, chunk 2220

> The innervation of the lacrimal gland involves three different components (Fig. 8.87). Sensory neurons from the lacrimal gland return to the CNS through the lacrimal branch of the ophthalmic nerve [V1]. Secretomotor fibers from the parasympathetic part of the autonomic division of the PNS stimulate fluid secretion from the lacrimal gland. These preganglionic parasympathetic neurons leave the CNS i

**[H] `medrag-anatomy_gray:2675`** — hal. 0, chunk 2675

> The lacrimal gland is associated with the upper eyelid and is in a small depression in the lateral roof of the orbit just posterior to the orbital margin. The multiple small ducts of the gland open into the upper margin of the conjunctival sac, which is the thin gap between the deep surface of the eyelid and the cornea. Tears are swept medially over the eye by blinking and are collected in small o

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---

## R-visceral-007  (R/visceral)

**QUERY:** How are the Accessory pancreatic duct and the Gallbladder anatomically related?

**MUST-HAVE:** accessorypancreaticduct, gallbladder

**Kunci lama (ditandai lemah panel):** medrag-anatomy_gray:680

**Teks kunci lama `medrag-anatomy_gray:680`:**

> The descending part (second part) of the duodenum is just to the right of midline and extends from the neck of the gallbladder to the lower border of vertebra LIII. Its anterior surface is crossed by the transverse colon, posterior to it is the right kidney, and medial to it is the head of the pancreas. This part of the duodenum contains the major duodenal papilla, which is the common entrance for

### Kandidat (acak, berlabel)

**[A] `medrag-anatomy_gray:702`** — hal. 0, chunk 702

> The body of the pancreas is elongate and extends from the neck to the tail of the pancreas. The tail of the pancreas passes between layers of the splenorenal ligament. The pancreatic duct begins in the tail of the pancreas (Fig. 4.109). It passes to the right through the body of the pancreas and, after entering the head of the pancreas, turns inferiorly. In the lower part of the head of the pancre

**[B] `medrag-anatomy_gray:705`** — hal. 0, chunk 705

> The duct system for the passage of bile extends from the liver, connects with the gallbladder, and empties into the descending part of the duodenum (Fig. 4.111). The coalescence of ducts begins in the liver parenchyma and continues until the right and left hepatic ducts are formed. These drain the respective lobes of the liver. The two hepatic ducts combine to form the common hepatic duct, which r

**[C] `medrag-anatomy_gray:607`** — hal. 0, chunk 607

> At the same time, the duodenum, together with its dorsal mesentery and an appreciable part of the pancreas, swings to the right and fuses to the body wall. Secondary fusion of the duodenum to the body wall, massive growth of the liver in the ventral mesentery, and fusion of the superior surface of the liver to the diaphragm restrict the opening to the space enclosed by the ballooned dorsal mesente

**[D] `medrag-anatomy_gray:706`** — hal. 0, chunk 706

> The omental foramen is posterior to these structures at this point. The bile duct continues to descend, passing posteriorly to the superior part of the duodenum before joining with the pancreatic duct to enter the descending part of the duodenum at the major duodenal papilla (Fig. 4.111). The spleen develops as part of the vascular system in the part of the dorsal mesentery that suspends the devel

**[E] `medrag-anatomy_gray:700`** — hal. 0, chunk 700

> The gallbladder is a pear-shaped sac lying on the visceral surface of the right lobe of the liver in a fossa between the right and quadrate lobes (Fig. 4.104). It has: a rounded end (fundus of the gallbladder), which may project from the inferior border of the liver; a major part in the fossa (body of the gallbladder), which may be against the transverse colon and the superior part of the duodenum

**[F] `medrag-anatomy_gray:827`** — hal. 0, chunk 827

> Fig. 4.106 Arterial supply to the liver and gallbladder. A. Schematic. B. Laparoscopic surgical view of cystic duct and cystic artery. Fig. 4.107 Pancreas. Fig. 4.108 Abdominal images. A. Abdominal computed tomogram, with contrast, in the axial plane. B. Abdominal ultrasound scan. GallbladderPancreasPortal veinSplenic veinStomachLeft colonic flexureSpleenLeft kidneyAortaInferior vena cavaRight lob

**[G] `medrag-anatomy_gray:680`** — hal. 0, chunk 680

> The descending part (second part) of the duodenum is just to the right of midline and extends from the neck of the gallbladder to the lower border of vertebra LIII. Its anterior surface is crossed by the transverse colon, posterior to it is the right kidney, and medial to it is the head of the pancreas. This part of the duodenum contains the major duodenal papilla, which is the common entrance for

**[H] `medrag-anatomy_gray:703`** — hal. 0, chunk 703

> One branch continues to the left, through the head of the pancreas, and may connect with the pancreatic duct at the point where it turns inferiorly. A second branch descends into the lower part of the head of the pancreas, anterior to the pancreatic duct, and ends in the uncinate process. The main and accessory pancreatic ducts usually communicate with each other. The presence of these two ducts r

**KEPUTUSAN →** `decision`: chunk / keep_current / none / item_flawed — `chosen_chunk_id`: ____

---
