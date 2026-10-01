# Worksheet Spot-Check Manusia (gold + faithfulness)

**Siapa yang mengisi: PENELITI.** Target pengisian: `human-spotcheck.csv` (kolom `value`,
`notes` opsional). Hasil dilaporkan sebagai *human-verified sample* + agreement/κ terhadap
panel — menutup kelemahan "verifikasi AI-assisted" (Limitations (1)/(2) paper).

## Bagian A — Verifikasi gold (30 item, seed 7: 15 unanimous + 15 non-unanimous)

Isi CSV `section=A`: `must_ok` (1/0) dan `query_ok` (1/0).

- Item F/R: `must_ok` = apakah gold must-structure benar target utama query.
- **Item A dengan gold must kosong (ambiguity valid):** `must_ok` = 1 bila query memang
  menggantung dan layak memicu klarifikasi (tidak ada satu struktur yang jelas ditunjuk);
  0 bila target sebenarnya bisa ditentukan dari query+history. `query_ok` = 1 bila
  referensinya natural dan konteks history cukup untuk lanjut.
- `query_ok` untuk semua tipe: query unambiguous dan answerable dari korpus.

### A1. `A-joints-001` (A/joints) — vote must_ok panel: 1/1/1
**Query:** What is the Sacrotuberous ligament?
**Gold must:** `sacrotuberousligament`
**Gold chunk:** The walls of the pelvic cavity consist of the sacrum, the coccyx, the pelvic bones inferior to the linea terminalis, two ligaments, and two muscles. Ligaments of the pelvic wall The sacrospinous and sacrotuberous ligaments (Fig. 5.29A) are major components of the lateral pelvic walls that help define the apertures between the pelvic cavity and adja…

### A2. `A-muscular-001` (A/muscular) — vote must_ok panel: 1/1/1
**Query:** What is the Common tendinous ring?
**Gold must:** `commontendinousring`
**Gold chunk:** The orientation and actions of the medial and lateral rectus muscles are more straightforward than those of the superior and inferior rectus muscles. The medial rectus originates from the medial part of the common tendinous ring medial to and below the optic canal, whereas the lateral rectus originates from the lateral part of the common tendinous …

### A3. `A-regions-005` (A/regions) — vote must_ok panel: 1/1/1
**Query:** the joint.
**Gold must:** *(kosong — item A valid, nilai sesuai aturan ambiguity di atas)*
**Gold chunk:**  *(tidak ada gold chunk)*

### A4. `A-regions-011` (A/regions) — vote must_ok panel: 1/1/1
**Query:** the joint.
**Gold must:** *(kosong — item A valid, nilai sesuai aturan ambiguity di atas)*
**Gold chunk:**  *(tidak ada gold chunk)*

### A5. `A-regions-015` (A/regions) — vote must_ok panel: 1/1/1
**Query:** the nerve.
**Gold must:** *(kosong — item A valid, nilai sesuai aturan ambiguity di atas)*
**Gold chunk:**  *(tidak ada gold chunk)*

### A6. `A-skeletal-001` (A/skeletal) — vote must_ok panel: 1/1/1
**Query:** What is the Patella?
**Gold must:** `patella`
**Gold chunk:** The patellar ligament is functionally the continuation of the quadriceps femoris tendon below the patella and is attached above to the apex and margins of the patella and below to the tibial tuberosity (Fig. 6.59). The more superficial fibers of the quadriceps femoris tendon and the patellar ligament are continuous over the anterior surface of the …

### A7. `F-cardiovascular-022` (F/cardiovascular) — vote must_ok panel: 1/1/1
**Query:** What is the function of the Short posterior ciliary arteries?
**Gold must:** `shortposteriorciliaryarteries`
**Gold chunk:** The arterial supply to the eyeball is from several sources: The short posterior ciliary arteries are branches from the ophthalmic artery that pierce the sclera around the optic nerve and enter the choroid layer (Fig. 8.108). The long posterior ciliary arteries, usually two, enter the sclera on the medial and lateral sides of the optic nerve and pro…

### A8. `F-fasciae-004` (F/fasciae) — vote must_ok panel: 1/1/1
**Query:** What is the Palmar aponeurosis?
**Gold must:** `palmaraponeurosis`
**Gold chunk:** The palmar digital nerves cross the palm deep to the palmar aponeurosis and the superficial palmar arch and enter the digits. They innervate skin on the palmar surfaces of the lateral three and one-half digits and cutaneous regions over the dorsal aspects of the distal phalanges (nail beds) of the same digits. In addition to skin, the digital nerve…

### A9. `F-fasciae-007` (F/fasciae) — vote must_ok panel: 1/1/1
**Query:** What is the Superior fibular retinaculum?
**Gold must:** `superiorfibularretinaculum`
**Gold chunk:** Fibular (peroneal) retinacula bind the tendons of the fibularis longus and fibularis brevis muscles to the lateral side of the foot (Fig. 6.112): A superior fibular retinaculum extends between the lateral malleolus and the calcaneus. An inferior fibular retinaculum attaches to the lateral surface of the calcaneus around the fibular trochlea and ble…

### A10. `F-joints-002` (F/joints) — vote must_ok panel: 1/1/1
**Query:** What is the Posterior longitudinal ligament?
**Gold must:** `posteriorlongitudinalligament`
**Gold chunk:** The posterior longitudinal ligament is on the posterior surfaces of the vertebral bodies and lines the anterior surface of the vertebral canal. Like the anterior longitudinal ligament, it is attached along its length to the vertebral bodies and intervertebral discs. The upper part of the posterior longitudinal ligament that connects CII to the intr…

### A11. `F-joints-012` (F/joints) — vote must_ok panel: 1/1/0
**Query:** Where is the Lateral meniscus located?
**Gold must:** `lateralmeniscus`
**Gold chunk:** There are two menisci, which are fibrocartilaginous C-shaped cartilages, in the knee joint, one medial (medial meniscus) and the other lateral (lateral meniscus) (Fig. 6.73). Both are attached at each end to facets in the intercondylar region of the tibial plateau. The medial meniscus is attached around its margin to the capsule of the joint and to…

### A12. `F-lymphoid-004` (F/lymphoid) — vote must_ok panel: 1/1/1
**Query:** What is the Brachiocephalic nodes?
**Gold must:** `brachiocephalicnodes`
**Gold chunk:** Nodes associated with the diaphragm interconnect with parasternal, prevertebral, and juxta-esophageal nodes, brachiocephalic nodes (anterior to the brachiocephalic veins in the superior mediastinum), and lateral aortic/lumbar nodes (in the abdomen). Superficial regions of the thoracic wall drain mainly into axillary lymph nodes in the axilla or par…

### A13. `F-muscular-002` (F/muscular) — vote must_ok panel: 1/1/1
**Query:** Where is the Sternohyoid muscle located?
**Gold must:** `sternohyoidmuscle`
**Gold chunk:** The sternohyoid muscle is a long, thin muscle originating from the posterior aspect of the sternoclavicular joint and adjacent manubrium of the sternum (Fig. 8.168). It ascends to insert onto the body of the hyoid bone. It depresses the hyoid bone and is innervated by the anterior rami of C1 to C3 through the ansa cervicalis. Lateral to the sternoh…

### A14. `F-muscular-006` (F/muscular) — vote must_ok panel: 1/1/1
**Query:** What is the function of the Tibialis posterior muscle?
**Gold must:** `tibialisposteriormuscle`
**Gold chunk:** The posterior surface of the box-like distal end of the tibia is marked by a vertical groove, which continues inferiorly and medially onto the posterior surface of the medial malleolus. The groove is for the tendon of the tibialis posterior muscle. The lateral surface of the distal end of the tibia is occupied by a deep triangular notch (the fibula…

### A15. `F-muscular-013` (F/muscular) — vote must_ok panel: 1/1/1
**Query:** What is the Superior gemellus muscle?
**Gold must:** `superiorgemellusmuscle`
**Gold chunk:** The inferior gluteal nerve, formed by branches from the dorsal divisions of L5 to S2, leaves the pelvic cavity through the greater sciatic foramen inferior to the piriformis muscle and supplies the gluteus maximus, the largest muscle in the gluteal region. Both superior and inferior gluteal nerves are accompanied by corresponding arteries. The nerv…

### A16. `F-muscular-020` (F/muscular) — vote must_ok panel: 1/1/1
**Query:** What is the Mylohyoid muscle?
**Gold must:** `mylohyoidmuscle`
**Gold chunk:** Like the muscles of mastication, the mylohyoid muscles are innervated by the mandibular nerve [V3]. The specific branch that innervates the mylohyoid muscles is the nerve to the mylohyoid from the inferior alveolar nerve. The geniohyoid muscles (Table 8.20) are paired cord-like muscles that run, one on either side of the midline, from the inferior …

### A17. `F-nervous-001` (F/nervous) — vote must_ok panel: 1/1/1
**Query:** What is the Genital branch of genitofemoral nerve?
**Gold must:** `genitalbranchofgenitofemoralnerve`
**Gold chunk:** Inguinal ligamentFemoral artery and veinInternal oblique muscleAponeurosis of internal oblique Spermatic cordConjoint tendonAnterior superior iliac spine Fig. 4.46 Transversus abdominis muscle and the inguinal canal. Fig. 4.47 A. Spermatic cord (men). B. Round ligament of uterus (women). Internal spermatic fasciaParietal layer of the tunica vaginal…

### A18. `F-nervous-012` (F/nervous) — vote must_ok panel: 1/1/1
**Query:** Where is the Cuneate fasciculus located?
**Gold must:** `cuneatefasciculus`
**Gold chunk:** First-order neuronal cells bodies of the posterior column–medial lemniscal pathway are located in a spinal ganglion (eFig. 9.53). Axons then enter the spinal cord through the posterior root to reach either the gracile fasciculus (gracile means “thin”), which carries information from the lower limb and trunk, or the cuneate fasciculus (cuneate means…

### A19. `F-regions-011` (F/regions) — vote must_ok panel: 1/1/1
**Query:** What is the Carotid triangle?
**Gold must:** `carotidtriangle`
**Gold chunk:** Fig. 8.170 Carotid triangle. SternocleidomastoidmuscleCarotid triangleSuperior belly ofomohyoid muscleCommon carotid arteryPosterior belly of digastric muscleInternal carotid arteryExternal carotid artery Fig. 8.171 Carotid system. Fig. 8.172 Glossopharyngeal nerve [IX] in the anterior triangle of the neck. Fig. 8.173 Vagus nerve [X] in the anterio…

### A20. `F-regions-019` (F/regions) — vote must_ok panel: 1/1/1
**Query:** Where is the Heel region located?
**Gold must:** `heelregion`
**Gold chunk:** The inferior surface of the body of the talus has a large oval concave facet (the posterior calcaneal articular facet) for articulation with the calcaneus. The posterior aspect of the body of the talus consists of a backward and medially facing projection (the posterior process). The posterior process is marked on its surface by a lateral tubercle …

### A21. `F-skeletal-005` (F/skeletal) — vote must_ok panel: 1/1/1
**Query:** What is the Vomer?
**Gold must:** `vomer`
**Gold chunk:** The middle part of the base of the skull is complex: Forming the anterior half are the vomer and sphenoid bones. Forming the posterior half are the occipital and paired temporal bones. Anteriorly, the small vomer is in the midline, resting on the sphenoid bone (Fig. 8.23). It contributes to the formation of the bony nasal septum separating the two …

### A22. `R-cardiovascular-001` (R/cardiovascular) — vote must_ok panel: 1/1/1
**Query:** How are the Posterior intercostal arteries and the Transverse cervical artery anatomically related?
**Gold must:** `posteriorintercostalarteries`, `transversecervicalartery`
**Gold chunk:** The blood supply to the trapezius is from the superficial branch of the transverse cervical artery, the acromial branch of the suprascapular artery, and the dorsal branches of posterior intercostal arteries. Latissimus dorsi is a large, flat triangular muscle that begins in the lower portion of the back and tapers as it ascends to a narrow tendon t…

### A23. `R-cardiovascular-008` (R/cardiovascular) — vote must_ok panel: 1/1/1
**Query:** How are the Azygos vein and the Left gastric artery anatomically related?
**Gold must:** `azygosvein`, `leftgastricartery`
**Gold chunk:** Passing through the esophageal hiatus with the esophagus are the anterior and posterior vagal trunks, the esophageal branches of the left gastric artery and vein, and a few lymphatic vessels. The third large opening in the diaphragm is the caval opening, through which the inferior vena cava passes from the abdominal cavity to the thoracic cavity (F…

### A24. `R-cardiovascular-033` (R/cardiovascular) — vote must_ok panel: 1/1/1
**Query:** How are the Superior thyroid vein and the Thyrocervical trunk anatomically related?
**Gold must:** `superiorthyroidvein`, `thyrocervicaltrunk`
**Gold chunk:** The major blood supply to the larynx is by the superior and inferior laryngeal arteries (Fig. 8.226): The superior laryngeal artery originates near the upper margin of the thyroid cartilage from the superior thyroid branch of the external carotid artery, and accompanies the internal branch of the superior laryngeal nerve through the thyrohyoid memb…

### A25. `R-cardiovascular-043` (R/cardiovascular) — vote must_ok panel: 1/1/1
**Query:** How are the Middle meningeal artery and the Superior petrosal sinus anatomically related?
**Gold must:** `middlemeningealartery`, `superiorpetrosalsinus`
**Gold chunk:** Contraction of the stapedius muscle, usually in response to loud noises, pulls the stapes posteriorly and prevents excessive oscillation. Numerous arteries supply the structures in the middle ear: the two largest branches are the tympanic branch of the maxillary artery and the mastoid branch of the occipital or posterior auricular arteries; smaller…

### A26. `R-muscular-009` (R/muscular) — vote must_ok panel: 1/1/1
**Query:** How are the Extensor indicis and the Supraspinatus muscle anatomically related?
**Gold must:** `extensorindicis`, `supraspinatusmuscle`
**Gold chunk:** Extension of the index, middle, ring, and little fingers is performed by the extensor digitorum muscle. Placing the fist in a palm-down position on the table and pressing the middle phalanges onto the table effectively immobilizes the action of the extensor digitorum. The freshman was therefore unable to elevate his middle finger (which was stickin…

### A27. `R-muscular-014` (R/muscular) — vote must_ok panel: 1/1/1
**Query:** How are the Adductor brevis and the Vastus intermedius muscle anatomically related?
**Gold must:** `adductorbrevis`, `vastusintermediusmuscle`
**Gold chunk:** Fig. 6.66 Deep artery of thigh. A. Anterior view. B. Posterior view. BSuperior gluteal arteryLateral femoral circumflex arteryCruciate anastomosesMedial circumflex femoral arteryFirst perforating arterySecond perforating arteryThird perforating arteryTerminal end of deepartery of thighPopliteal arteryAdductor magnus muscleAdductor hiatusInferior gl…

### A28. `R-nervous-011` (R/nervous) — vote must_ok panel: 1/1/1
**Query:** How are the Cauda equina and the Central canal anatomically related?
**Gold must:** `caudaequina`, `centralcanal`
**Gold chunk:** The collection of lumbar and sacral nerve roots beyond the conus medullaris has a horsetail-like appearance, from which it derives its name “cauda equina.” Compression of the cauda equina may be caused by a herniating disc (as in this case), fracture fragments following traumatic injury, tumor, abscess, or severe degenerative stenosis of the centra…

### A29. `R-nervous-018` (R/nervous) — vote must_ok panel: 1/1/1
**Query:** How are the Lateral pectoral nerve and the Long thoracic nerve anatomically related?
**Gold must:** `lateralpectoralnerve`, `longthoracicnerve`
**Gold chunk:** Terminal nervesCordsDivisionsTrunksRoots (anterior rami)C5C6C7C8T1SuperiorMiddleInferiorLateralPosteriorPosteriorPosteriorPosteriorMedialAnteriorAnteriorAnterior ALateral pectoral nerveMedial pectoral nerveMedial cutaneous nerve of armMedial cutaneous nerve of forearmMusculocutaneousMedianRadialUlnarAxillaryLong thoracicnerveSuprascapular nerveDors…

### A30. `R-visceral-004` (R/visceral) — vote must_ok panel: 1/1/1
**Query:** How are the Liver and the Transverse colon anatomically related?
**Gold must:** `liver`, `transversecolon`
**Gold chunk:** At the junction of the ascending and transverse colon is the right colic flexure, which is just inferior to the right lobe of the liver (Fig. 4.89). A similar, but more acute bend (the left colic flexure) occurs at the junction of the transverse and descending colon. This bend is just inferior to the spleen, is higher and more posterior than the ri…

## Bagian B — Faithfulness jawaban B3 trio (20 jawaban, seed 7: 7 GLM / 7 DeepSeek / 6 Qwen)

Rubric SAMA dengan judge agar bisa dibandingkan langsung: **5** = setiap klaim faktual
didukung konteks yang dikutip; **1** = mayoritas tidak didukung. Jangan pakai pengetahuan
luar untuk memaafkan klaim. Isi CSV `section=B`: `value` = 1–5, `notes` = klaim tak didukung.

### B1. `R-cardiovascular-016` [glm]
**Question:** How are the Internal thoracic artery and the Subcostal artery anatomically related?
**Answer:** The context describes the **** in detail, but it does not mention the **** at all, so a direct anatomical relationship between the two cannot be established from the provided context alone.

**What the context says about the internal thoracic artery:**
- It arises as the third branch of the subclavian artery, branching from that vessel's inferior edge [3].
- It passes anteriorly over the cervical dome of the [1], posterior to the and the large veins of the region, and anterior to the pleural cavity [3].
- It enters the thoracic cavity posterior to the ribs and anterior to the [3], and gives rise to the anterior intercostal arteries [1][2].
- In the diagram of thoracic-wall arteries, its associated terminal branches are the and [5].

**General note:** The subcostal artery is not covered in the context. In general anatomy, each subcostal artery arises from the posterior surface of the just
**Cited context:**
- [1] The anterior intercostal arteries originate directly or indirectly as lateral branches from the internal thoracic arteries (Fig. 3.29). Each internal thoracic artery arises as a major branch of the subclavian artery in the neck. It passes a…
- [2] The transversus thoracis muscles lie deep to the internal thoracic vessels and secure these vessels to the wall. Vessels that supply the thoracic wall consist mainly of posterior and anterior intercostal arteries, which pass around the wall…
- [3] The third branch of the subclavian artery is the internal thoracic artery (Fig. 8.191). This artery branches from the inferior edge of the subclavian artery and descends. It passes posterior to the clavicle and the large veins in the region…

### B2. `F-fasciae-006` [glm]
**Question:** Where is the Clavipectoral fascia located?
**Answer:** The **clavipectoral fascia** is a thick sheet of deep fascia located in the **pectoral region**, deep to the pectoralis major muscle.

Its position can be described as follows:

- It attaches **above to the clavicle** and **below to the floor of the axilla**, forming a continuous layer of deep fascia [1][2].
- It **encloses two muscles**: the **subclavius** and the **pectoralis minor**, and spans the gap between them [1][2].
- In effect, it connects the clavicle to the floor of the axilla, forming part of the anterior wall of the axilla [1][2].

Several structures are associated with or pass through this fascia, as illustrated in the referenced figure [3]:

- The **cephalic vein**, which passes deep to the clavicular head in the clavipectoral triangle (the cleft between the deltoid, pectoralis major, and clavicle) [5]
- The **lateral pectoral nerve** and **medial pectoral nerve** [2][3]

**Cited context:**
- [1] A continuous layer of deep fascia, the clavipectoral fascia, encloses the subclavius and pectoralis minor and attaches to the clavicle above and to the floor of the axilla below. The muscles of the pectoral region form the anterior wall of …
- [2] The pectoralis minor is innervated by the medial pectoral nerve, which originates from the brachial plexus in the axilla. The clavipectoral fascia is a thick sheet of connective tissue that connects the clavicle to the floor of the axilla (…
- [3] Fig. 7.41 Pectoralis major muscle. Fig. 7.42 Pectoralis minor and subclavius muscles and clavipectoral fascia. Pectoralis majorPectoralis majorPectoralis minorClavipectoral fasciaCephalic veinLateral pectoral nerveMedial pectoralnervesPecto…

### B3. `F-cardiovascular-022` [glm]
**Question:** What is the function of the Short posterior ciliary arteries?
**Answer:** According to the context, the **short posterior ciliary arteries** are branches of the [2].

Their function/path is:

- They pierce the around the optic nerve [2].
- After piercing the sclera, they enter the **choroid layer** of the eyeball, where they contribute to its blood supply [2].

Note: The context describes their course and entry into the choroid but does not provide further detail on their specific distribution within the choroid. **General note:** the choroid is the vascular layer of the eyeball, so these arteries essentially supply the vascular coat surrounding the.
**Cited context:**
- [2] The arterial supply to the eyeball is from several sources: The short posterior ciliary arteries are branches from the ophthalmic artery that pierce the sclera around the optic nerve and enter the choroid layer (Fig. 8.108). The long poster…

### B4. `F-fasciae-004` [glm]
**Question:** What is the Palmar aponeurosis?
**Answer:** The **palmar aponeurosis** () is a fibrous structure located in the of the hand. Based on the provided context:

- It consists of **longitudinally arranged bundles** that continue into the digits, with **transverse fibers** interconnecting these bundles [2].
- Important structures lie **deep** to it in the palm, including **vessels, nerves, and the long flexor tendons** [2].

The context does not provide a fuller definition (e.g., its embryological origin, its relationship to the palmaris longus tendon, or its role in conditions like Dupuytren's contracture).

**General note:** The palmar aponeurosis is classically described as the thickened deep fascia of the palm, often continuous with the tendon of the palmaris longus muscle. It anchors the skin of the palm and helps protect the underlying neurovascular structures and flexor tendons. Its progressive fibrotic thickening and contracture
**Cited context:**
- [2] Transverse fibers interconnect the more longitudinally arranged bundles that continue into the digits. Vessels, nerves, and long flexor tendons lie deep to the palmar aponeurosis in the palm. The palmaris brevis, a small intrinsic muscle of…

### B5. `A-regions-018` [glm]
**Question:** Tell me more about one of them.
**Answer:** Let's take a closer look at the **ulnar nerve**.

**Origin and course**
- It is a large terminal branch of the medial cord of the brachial plexus, and near its origin it often receives a communicating branch from the lateral root of the median nerve, carrying C7 fibers [6].
- It passes down the arm and then behind the medial epicondyle of the on its way to the forearm [5][6].

**Innervation in the forearm**
- Soon after entering the forearm, it gives muscular branches to the flexor carpi ulnaris and to the medial half of the [1].
- This fits the general rule that the median nerve supplies most muscles of the anterior forearm compartment, with exactly these two exceptions [4].

**Cutaneous distribution**
- A palmar branch arises in the middle of the forearm and supplies skin on the medial side of the [1].
- In the hand, the ulnar nerve supplies the medial one and one-half digits [3].

**I
**Cited context:**
- [1] In the forearm the ulnar nerve gives rise to: muscular branches to the flexor carpi ulnaris and to the medial half of the flexor digitorum profundus that arise soon after the ulnar nerve enters the forearm; and two small cutaneous branches—…
- [2] Radial nerve • All muscles in posterior compartment of arm and forearmUlnar nerve• Most intrinsic muscles in hand• Flexor carpi ulnaris and medial half of flexor digitorum profundus in forearmMusculocutaneous nerve• All muscles in anterior …
- [3] The musculocutaneous nerve innervates skin on the anterolateral side of the forearm. The median nerve innervates the palmar surface of the lateral three and one-half digits, and the ulnar nerve innervates the medial one and one-half digits.…

### B6. `F-joints-018` [glm]
**Question:** What is the function of the Posterior sternoclavicular ligament?
**Answer:** The provided context does not contain information about the **posterior sternoclavicular ligament** specifically. The context only describes the sternoclavicular joint itself — a synovial, saddle-shaped joint between the proximal end of the and the clavicular notch of the manubrium with part of the first costal cartilage [1] — and mentions other related ligaments, such as the, which links the ends of the two clavicles to each other and to the manubrium, and the, which links the proximal to the and its costal cartilage [3]. The function of the is not stated in these blocks.

**General note:** The posterior sternoclavicular ligament is a broadening of the joint capsule on the posterior (back) aspect of the sternoclavicular joint. Its main functions are to strengthen the joint posteriorly and to limit anterior displacement of the medial end of the clavicle — that is, it prevents the clavicl
**Cited context:**
- [1] The glenohumeral joint (shoulder joint) is the articulation between the humerus of the arm and the scapula. The sternoclavicular joint occurs between the proximal end of the clavicle and the clavicular notch of the manubrium of the sternum …
- [3] An interclavicular ligament links the ends of the two clavicles to each other and to the superior surface of the manubrium of the sternum. The costoclavicular ligament is positioned laterally to the joint and links the proximal end of the c…

### B7. `F-nervous-019` [glm]
**Question:** What is the Inferior subscapular nerve?
**Answer:** The **inferior subscapular nerve** is a small motor branch of the brachial plexus. It arises from the **posterior cord**, originating sequentially together with the superior subscapular and thoracodorsal nerves, and passes directly into muscles associated with the posterior wall of the axilla [2]. Like these related nerves — all except the radial nerve — it innervates muscles of the shoulder region or the posterior axillary wall rather than continuing into the arm [2].

**Function:** The nerve helps innervate the **subscapularis muscle**, which receives its supply from the superior and inferior subscapular nerves; these branches originate in the axilla [5].

**General note:** Beyond the subscapularis, the inferior subscapular nerve also typically supplies the **teres major muscle**, which forms the inferolateral part of the posterior axillary wall together with the tendon of the **latiss
**Cited context:**
- [2] All these nerves except the radial nerve innervate muscles associated with the shoulder region or the posterior wall of the axilla; the radial nerve passes into the arm and forearm. The superior subscapular, thoracodorsal, and inferior subs…
- [5] The subscapularis is innervated by branches of the brachial plexus (the superior and inferior subscapular nerves), which originate in the axilla. The inferolateral aspect of the posterior wall of the axilla is formed by the terminal part of…

### B8. `R-skeletal-004` [deepseek]
**Question:** How are the Arytenoid cartilage and the Cricoid cartilage anatomically related?
**Answer:** The **arytenoid cartilages** sit directly on top of the **cricoid cartilage**, forming the crico-arytenoid joints.

- Each **arytenoid cartilage** is pyramid-shaped, with a concave **base** that articulates with a sloping articular facet on the superolateral surface of the lamina of the [4]. The facet for articulation with the arytenoid cartilage is a named feature of the cricoid cartilage [2].
- The joint between them — formed by articular facets on the superolateral surfaces of the cricoid and the bases of the arytenoids — is the crico-arytenoid joint [6].
- Because the **arytenoid cartilages** rest on the lamina of the, the **vocal ligaments** run between the posterior aspect of the thyroid angle and the arytenoids; forward movement and downward rotation of the thyroid cartilage on the cricoid therefore lengthens and tenses the vocal ligaments [6].
- The **apex** of each articulates a
**Cited context:**
- [2] Fig. 8.209 Larynx. A. Relationship to other cavities. B. Lateral view. Fig. 8.210 Cricoid cartilage. A. Anterolateral view. B. Posterior view. Facet for articulation witharytenoid cartilageFacet for articulation withinferior horn of thyroid…
- [4] The two arytenoid cartilages are pyramid-shaped cartilages with three surfaces, a base of arytenoid cartilage and an apex of arytenoid cartilage (Fig. 8.213): The base is concave and articulates with the sloping articular facet on the super…
- [6] Because the vocal ligaments pass between the posterior aspect of the thyroid angle and the arytenoid cartilages that sit on the lamina of cricoid cartilage, forward movement and downward rotation of the thyroid cartilage on the cricoid cart…

### B9. `F-joints-021` [deepseek]
**Question:** What is the function of the Interclavicular ligament?
**Answer:** **Interclavicular ligament**

- The links the ends of the twos to each other and to the superior surface of the manubrium of the sternum [1].
- It therefore spans the midline above the sternum, connecting the two clavicles across the top of the manubrium [1].

The context does not describe its function in explicit mechanical terms beyond this connecting role; it is described alongside the costoclavicular ligament, which lies lateral to the joint and links the proximal end of the clavicle to the first rib and related costal cartilage [1].

General note: by bridging the two clavicles and the manubrium, the interclavicular ligament helps stabilize the sternoclavicular joints and resists excessive downward displacement of the clavicle. The context notes that the clavicle is the only bony connection between the upper limb and trunk, and that sternoclavicular dislocations occur [3], which is c
**Cited context:**
- [1] An interclavicular ligament links the ends of the two clavicles to each other and to the superior surface of the manubrium of the sternum. The costoclavicular ligament is positioned laterally to the joint and links the proximal end of the c…
- [3] In the clinic Fractures of the clavicle and dislocations of the acromioclavicular and sternoclavicular joints The clavicle provides the only bony connection between the upper limb and trunk. Given its relative size and the potential forces …

### B10. `A-regions-002` [deepseek]
**Question:** this bone.
**Answer:** The **femur** is the bone of the thigh and the longest bone in the body [2]. Its proximal end is characterized by a **head** and **neck**, plus two large projections — the greater and lesser trochanters — on the upper part of the shaft [2].

- The articulates in the ball-and-socket hip joint with the of the pelvic bone [5].
- The provides attachment for the ligament of the head of the femur, while blood vessels and nerves pass through the [2].
- The is clinically important: a fracture here can interrupt the blood supply to the head of the femur, which may run via vessels in the retinacular fibers [3]. By contrast, an intertrochanteric fracture would not damage those vessels [3].
- The is one of the two projections at the upper shaft [2]. (The greater trochanter has no key in the allowed list.)
- At its distal end, the femur's major weight-bearing articulation is with the, and it also art
**Cited context:**
- [2] The acetabular fossa provides attachment for the ligament of the head of the femur, whereas blood vessels and nerves pass through the acetabular notch. The femur is the bone of the thigh and the longest bone in the body. Its proximal end is…
- [3] Unfortunately for this patient, the sole blood supply to the head of the femur was via the vessels in the retinacula fibers, which were transected at the time of the fracture. If the patient had an intertrochanteric fracture instead, the ve…
- [5] The bones of the gluteal region and the thigh are the pelvic bone and the femur (Fig. 6.8). The large ball and socket joint between these two bones is the hip joint. The femur is the bone of the thigh. At its distal end, its major weight-be…

### B11. `F-joints-008` [deepseek]
**Question:** What is the function of the Interosseous membrane of leg?
**Answer:** The **interosseous membrane of the leg** is a tough fibrous sheet of connective tissue spanning the space between the facing interosseous borders of the and shafts [1].

Its functions, according to the context, are:

- **Linking the bones**: it connects the and together [2].
- **Muscle attachment**: it increases the surface area available for muscle attachment [2].
- **Stabilizing the distal ends**: its inferior part holds the distal ends of the and together, spanning the narrow space between the on the lateral surface of the distal tibia and the corresponding surface on the distal fibula [2].

The context also notes that the collagen fibers of this membrane descend obliquely [1].

Note: the same source describes a separate interosseous membrane in the forearm connecting the and [3] — that is a different structure from the one asked about.

The context does not detail any additional mech
**Cited context:**
- [1] The posterior surface of the lateral malleolus is marked by a shallow groove for the tendons of the fibularis longus and fibularis brevis muscles. Interosseous membrane of leg The interosseous membrane of the leg is a tough fibrous sheet of…
- [2] The interosseous membrane not only links the tibia and fibula together, but also provides an increased surface area for muscle attachment. The distal ends of the fibula and tibia are held together by the inferior aspect of the interosseous …
- [3] The distal radio-ulnar joint allows the distal end of the radius to move anteromedially over the ulna. The interosseous membrane is a thin fibrous sheet that connects the medial and lateral borders of the radius and ulna, respectively (Fig.…

### B12. `A-regions-019` [deepseek]
**Question:** Tell me more about one of them.
**Answer:** The **radial artery** is one of the two major branches of the at the. The enters the forearm through the, and at its apex it divides into the and [5]. The originates at approximately the neck of the and passes along the lateral aspect of the forearm, just deep to the [5].

- In the forearm, branches of the include a radial recurrent artery and a small palmar carpal branch, which contribute to anastomotic networks around the elbow and carpal bones [1].
- Distally, the curves around the lateral side of the wrist, passes over the floor of the anatomical snuffbox, and enters the deep plane of the palm by penetrating anteriorly through the back of the hand [4].
- It then passes between the two heads of the first dorsal interosseous muscle and between the two heads of the adductor pollicis to reach the deep palm [4].
- Atlas figures of the hand label the and, showing the arterial supply of the
**Cited context:**
- [1] Branches of the radial artery originating in the forearm include: a radial recurrent artery, which contributes to an anastomotic network around the elbow joint and to numerous vessels that supply muscles on the lateral side of the forearm (…
- [2] Fig. 7.109 Arterial supply of the right hand. Fig. 7.110 Superficial palmar arch, right hand. Fig. 7.111 Deep palmar arch, right hand. Radial arteryUlnar arteryUlnar nerveDeep branchof ulnar arteryPerforatingarteryPalmarmetacarpalarteriesDe…
- [4] The radial artery curves around the lateral side of the wrist and passes over the floor of the anatomical snuffbox and into the deep plane of the palm by penetrating anteriorly through the back of the hand (Figs. 7.109 and 7.111). It passes…

### B13. `F-visceral-003` [deepseek]
**Question:** What is the function of the Inferior parathyroid gland?
**Answer:** The CONTEXT does not describe the specific function of the **inferior parathyroid gland** in detail — it mainly covers the gland's anatomy and surgical relationships.

What the context does tell us:

- The parathyroid glands are two pairs of small glands, so the inferior pair sits alongside the superior pair [2].
- They are closely related to the, bound to the and by ligaments, together with branches of the [2].
- Their secretion — parathyroid hormone — controls serum calcium: when secretion falls, serum calcium drops and neuromuscular excitability increases [6].

**General note:** The inferior parathyroid glands (like the superior ones) produce parathyroid hormone (PTH), which raises blood calcium by stimulating bone resorption, renal calcium reabsorption, and activation of vitamin D. Their blood supply typically comes from the, a branch of the [3][4], which is why that vessel is at ris
**Cited context:**
- [2] Together with branches of the inferior thyroid arteries, the recurrent laryngeal nerves are clearly related to, and may pass through ligaments, one on each side, that bind the thyroid gland to the trachea and to the cricoid cartilage of the…
- [3] Inferior thyroid artery. The inferior thyroid artery (Fig. 8.191) is the superior continuation of the thyrocervical trunk. It ascends, anterior to the anterior scalene muscle, and eventually turns medially, crossing posterior to the carotid…
- [4] The posterior glandular branch passes to the posterior side of the gland and may anastomose with the inferior thyroid artery (Fig. 8.180). Inferior thyroid artery. The inferior thyroid artery is a branch of the thyrocervical trunk, which ar…

### B14. `A-regions-012` [deepseek]
**Question:** that vessel.
**Answer:** You selected the ****. It lies mostly posterior to the and extends across the posterior abdominal wall from the on the right to the on the left [1]. It is secondarily retroperitoneal except for a small part of its tail and consists of a head, uncinate process, neck, body, and tail [1]. The head lies within the C-shaped concavity of the duodenum [1].

The body is elongate, extending from the neck to the tail; the tail passes between layers of the splenorenal ligament [3]. The begins in the tail, passes to the right through the body, and after entering the head turns inferiorly [3].

Arterial supply includes the from the, the anterior and posterior superior pancreaticoduodenal arteries from the gastroduodenal artery, and the dorsal pancreatic artery from the inferior pancreatic artery, a branch of the [5]. The contacts the body of the pancreas as it crosses the posterior abdominal wall [6]
**Cited context:**
- [1] The pancreas lies mostly posterior to the stomach (Figs. 4.107 and 4.108). It extends across the posterior abdominal wall from the duodenum, on the right, to the spleen, on the left. The pancreas is (secondarily) retroperitoneal except for …
- [3] The body of the pancreas is elongate and extends from the neck to the tail of the pancreas. The tail of the pancreas passes between layers of the splenorenal ligament. The pancreatic duct begins in the tail of the pancreas (Fig. 4.109). It …
- [5] The arterial supply to the pancreas (Fig. 4.110) includes the: gastroduodenal artery from the common hepatic artery (a branch of the celiac trunk), anterior superior pancreaticoduodenal artery from the gastroduodenal artery, posterior super…

### B15. `F-cardiovascular-002` [qwen]
**Question:** Where is the Iliolumbar artery located?
**Answer:** The is a branch of the posterior trunk of the [1]. The arises from the at about the L5–S1 intervertebral disc, courses inferiorly over the pelvic inlet, and divides into anterior and posterior trunks at the superior border of the [3].

The ascends laterally back out of the pelvic inlet and divides into a lumbar branch and an iliac branch [1]. The lumbar branch contributes to the blood supply of the posterior abdominal wall, psoas, and [1].
**Cited context:**
- [1] Branches of the posterior trunk of the internal iliac artery are the iliolumbar artery, the lateral sacral artery, and the superior gluteal artery (Fig. 5.64). The iliolumbar artery ascends laterally back out of the pelvic inlet and divides…
- [3] The internal iliac artery originates from the common iliac artery on each side, approximately at the level of the intervertebral disc between LV and SI, and lies anteromedial to the sacro-iliac joint (Fig. 5.64). The vessel courses inferior…

### B16. `F-joints-003` [qwen]
**Question:** What is the Pisometacarpal ligament?
**Answer:** The CONTEXT does not contain enough information to define the. It only describes the base of the carpal arch, formed medially by the pisiform and hook of hamate, and the flexor retinaculum converting it into the carpal tunnel [4].

General note: The is a small ligament on the ulnar side of the wrist that connects the pisiform bone to the base of the fifth metacarpal. It is often described as a continuation of the flexor retinaculum/palmar carpal ligament and helps stabilize the pisiform and the ulnar aspect of the hand.
**Cited context:**
- [4] The base of the carpal arch is formed medially by the pisiform and the hook of the hamate and laterally by the tubercles of the scaphoid and trapezium. The flexor retinaculum is a thick connective tissue ligament that bridges the space betw…

### B17. `A-nervous-006` [qwen]
**Question:** What is the Spinal dura?
**Answer:** The **** is the outermost meningeal membrane surrounding the spinal cord [1][2].

- It is continuous superiorly with the inner meningeal layer of the cranial dura mater at the foramen magnum [1][2].
- It extends inferiorly to the posterior surface of the vertebral body of S2, where the dural sac narrows [1][2].
- It is separated from the bones of the vertebral canal by the epidural/extradural space [1][2].
- As spinal nerves and roots pass laterally, they are surrounded by tubular sleeves of dura mater that merge with the nerves’ outer covering, the epineurium [5].
**Cited context:**
- [1] The spinal dura mater is the outermost meningeal membrane and is separated from the bones forming the vertebral canal by an extradural space (Fig. 2.59). Superiorly, it is continuous with the inner meningeal layer of cranial dura mater at t…
- [2] Like the brain, the spinal cord is surrounded by three concentric meninges: the dura mater, arachnoid mater, and pia mater. The spinal dura mater is continuous with the inner meningeal layer of the cranial dura mater and extends inferiorly …
- [5] As spinal nerves and their roots pass laterally, they are surrounded by tubular sleeves of dura mater, which merge with and become part of the outer covering (epineurium) of the nerves. The arachnoid mater is a thin delicate membrane agains…

### B18. `A-muscular-002` [qwen]
**Question:** What is the Adductor magnus?
**Answer:** The **** is the largest and deepest muscle in the medial compartment of the thigh [1]. It is triangular or fan-shaped [1]. It forms the distal posterior wall of the adductor canal [1].

Its attachments include:

- On the pelvis, it attaches along a line extending from the ****, above the attachments of the **** and ****, and along the ramus of the **** to the **** [2].
- The part arising from the **** expands laterally and inferiorly to insert on the **** [2].
- Its medial “hamstring part” originates from the **** [3], descends almost vertically [3], and inserts via a rounded tendon into the **** on the medial condyle of the distal head of the **** [3].
- It also inserts via an aponeurosis onto the **** [3].

The context does not state its action or innervation.

General note: In broader anatomy, the primarily adducts the thigh and has dual innervation involving the and the tibial divisi
**Cited context:**
- [1] The adductor brevis adducts and medially rotates the thigh at the hip joint and is innervated by the obturator nerve. The adductor magnus is the largest and deepest of the muscles in the medial compartment of the thigh (Fig. 6.62). The musc…
- [2] On the pelvis, the adductor magnus is attached along a line that extends from the inferior pubic ramus, above the attachments of the adductor longus and brevis muscles, and along the ramus of the ischium to the ischial tuberosity. The part …
- [3] The medial part of the adductor magnus, often called the “hamstring part,” originates from the ischial tuberosity of the pelvic bone and descends almost vertically along the thigh to insert via a rounded tendon into the adductor tubercle on…

### B19. `F-cardiovascular-006` [qwen]
**Question:** Where is the Posterior inferior cerebellar artery located?
**Answer:** The arises from the before the paired arteries merge to form the [2]. It is described as a branch of the [3].

Its associated region includes the lateral aspect of the medulla and the inferior portion of the cerebellum, which it perfuses [2].
**Cited context:**
- [2] Before merging and forming the basilar artery, each vertebral artery gives rise to a posterior inferior cerebellar artery (PICA) and posterior spinal artery and contributes to the formation of the anterior spinal artery (eFig. 9.42). The PI…
- [3] The first is a posterior inferior cerebellar artery. A second branch is the posterior spinal artery, which passes posteriorly around the medulla and then descends on the posterior surface of the spinal cord in the area of the attachment of …

### B20. `R-cardiovascular-014` [qwen]
**Question:** How are the Left colic artery and the Sigmoid arteries anatomically related?
**Answer:** The provided context does not directly describe the, so their exact relationship to the cannot be established from the atlas facts alone.

What the context does show:

- The is the first branch of the [1].
- It ascends retroperitoneally, divides into ascending and descending branches, and its ascending branch passes anterior to the left, enters the, and supplies the upper and distal [1].
- The receives arterial supply from the [2].
- The begins as the continuation of the above the pelvic inlet and is suspended by the sigmoid [4].

General note: In standard anatomy, the are usually branches of the arising distal to the, supplying the and anastomosing with the and branches of the.
**Cited context:**
- [1] The left colic artery is the first branch of the inferior mesenteric artery (Fig. 4.128). It ascends retroperitoneally, dividing into ascending and descending branches: The ascending branch passes anteriorly to the left kidney, then enters …
- [2] The arterial supply to the transverse colon (Fig. 4.90) includes: the right colic artery from the superior mesenteric artery, the middle colic artery from the superior mesenteric artery, and the left colic artery from the inferior mesenteri…
- [4] The final segment of the colon (the sigmoid colon) begins above the pelvic inlet and extends to the level of vertebra SIII, where it is continuous with the rectum (Fig. 4.88). This S-shaped structure is quite mobile except at its beginning,…
