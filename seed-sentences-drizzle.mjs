/**
 * Database seed script using Drizzle ORM to populate sentences
 * Run with: node seed-sentences-drizzle.mjs
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const sentencesByGrade = {
  m1: [
    { englishText: "My name is John.", thaiMeaning: "ชื่อของฉันคือจอห์น" },
    { englishText: "I am a student.", thaiMeaning: "ฉันเป็นนักเรียน" },
    { englishText: "She likes to read books.", thaiMeaning: "เธอชอบอ่านหนังสือ" },
    { englishText: "He plays football every day.", thaiMeaning: "เขาเล่นฟุตบอลทุกวัน" },
    { englishText: "We go to school in the morning.", thaiMeaning: "เราไปโรงเรียนในตอนเช้า" },
    { englishText: "They have lunch at noon.", thaiMeaning: "พวกเขากินอาหารกลางวันเวลาเที่ยง" },
    { englishText: "I eat breakfast every morning.", thaiMeaning: "ฉันกินอาหารเช้าทุกเช้า" },
    { englishText: "She drinks milk before bed.", thaiMeaning: "เธอดื่มนมก่อนนอน" },
    { englishText: "Do you like ice cream?", thaiMeaning: "คุณชอบไอศกรีมหรือไม่" },
    { englishText: "What is your favorite color?", thaiMeaning: "สีโปรดของคุณคืออะไร" },
    { englishText: "I have a cat at home.", thaiMeaning: "ฉันมีแมวที่บ้าน" },
    { englishText: "She is very smart.", thaiMeaning: "เธอฉลาดมาก" },
    { englishText: "He is tall and strong.", thaiMeaning: "เขาสูงและแข็งแรง" },
    { englishText: "We are friends.", thaiMeaning: "เราเป็นเพื่อน" },
    { englishText: "They are happy.", thaiMeaning: "พวกเขามีความสุข" }
  ],
  m2: [
    { englishText: "I am studying English right now.", thaiMeaning: "ฉันกำลังเรียนภาษาอังกฤษตอนนี้" },
    { englishText: "She is playing tennis with her friends.", thaiMeaning: "เธอกำลังเล่นเทนนิสกับเพื่อน ๆ ของเธอ" },
    { englishText: "They were watching a movie last night.", thaiMeaning: "พวกเขากำลังดูหนังเมื่อคืน" },
    { englishText: "I went to the beach last summer.", thaiMeaning: "ฉันไปชายหาดเมื่อฤดูร้อนที่แล้ว" },
    { englishText: "She bought a new dress yesterday.", thaiMeaning: "เธอซื้อชุดใหม่เมื่อวาน" },
    { englishText: "He didn't finish his homework.", thaiMeaning: "เขาไม่ได้ทำการบ้านให้เสร็จ" },
    { englishText: "What did you do last weekend?", thaiMeaning: "คุณทำอะไรในสุดสัปดาห์ที่แล้ว" },
    { englishText: "The weather is beautiful today.", thaiMeaning: "อากาศสวยงามวันนี้" },
    { englishText: "This book is more interesting than that one.", thaiMeaning: "หนังสือเล่มนี้น่าสนใจมากกว่าเล่มนั้น" },
    { englishText: "She is the tallest girl in our class.", thaiMeaning: "เธอเป็นผู้หญิงที่สูงที่สุดในชั้นเรียนของเรา" },
    { englishText: "I have never been to Japan.", thaiMeaning: "ฉันไม่เคยไปญี่ปุ่นมาก่อน" },
    { englishText: "She has lived in Bangkok for five years.", thaiMeaning: "เธออาศัยอยู่ในกรุงเทพฯ มาห้าปีแล้ว" },
    { englishText: "They have just arrived at the airport.", thaiMeaning: "พวกเขาเพิ่งมาถึงสนามบิน" },
    { englishText: "I like playing basketball more than football.", thaiMeaning: "ฉันชอบเล่นบาสเกตบอลมากกว่าฟุตบอล" },
    { englishText: "She is as intelligent as her brother.", thaiMeaning: "เธอฉลาดเท่ากับพี่ชายของเธอ" }
  ],
  m3: [
    { englishText: "I will go to university next year.", thaiMeaning: "ฉันจะไปมหาวิทยาลัยในปีหน้า" },
    { englishText: "She is going to study medicine.", thaiMeaning: "เธอจะเรียนวิชาการแพทย์" },
    { englishText: "If it rains tomorrow, we will stay at home.", thaiMeaning: "ถ้าฝนตกพรุ่งนี้ เราจะอยู่บ้าน" },
    { englishText: "Unless you study hard, you won't pass the exam.", thaiMeaning: "เว้นแต่คุณจะเรียนหนัก คุณจะสอบไม่ผ่าน" },
    { englishText: "I would help you if I could.", thaiMeaning: "ฉันจะช่วยคุณถ้าฉันทำได้" },
    { englishText: "She said that she would come tomorrow.", thaiMeaning: "เธอบอกว่าเธอจะมาพรุ่งนี้" },
    { englishText: "He asked me whether I liked the movie.", thaiMeaning: "เขาถามฉันว่าฉันชอบหนังหรือไม่" },
    { englishText: "Although it was difficult, they managed to finish the project.", thaiMeaning: "แม้ว่ามันยาก พวกเขาก็สามารถทำโครงการให้เสร็จสิ้น" },
    { englishText: "Because she was sick, she didn't come to school.", thaiMeaning: "เพราะเธอป่วย เธอจึงไม่ไปโรงเรียน" },
    { englishText: "The student who won the prize is very talented.", thaiMeaning: "นักเรียนที่ชนะรางวัลนั้นมีพรสวรรค์มาก" },
    { englishText: "I'm interested in learning new languages.", thaiMeaning: "ฉันสนใจที่จะเรียนภาษาใหม่" },
    { englishText: "She is capable of doing the job well.", thaiMeaning: "เธอสามารถทำงานได้ดี" },
    { englishText: "They are responsible for the success of the project.", thaiMeaning: "พวกเขารับผิดชอบต่อความสำเร็จของโครงการ" },
    { englishText: "I'm looking forward to seeing you next week.", thaiMeaning: "ฉันรอคอยที่จะเห็นคุณในสัปดาห์หน้า" },
    { englishText: "She is aware of the situation.", thaiMeaning: "เธอตระหนักถึงสถานการณ์" }
  ],
  m4: [
    { englishText: "The report was completed by the team yesterday.", thaiMeaning: "รายงานได้รับการเสร็จสิ้นโดยทีมเมื่อวาน" },
    { englishText: "She has been working on this project for three months.", thaiMeaning: "เธอทำงานในโครงการนี้มาสามเดือนแล้ว" },
    { englishText: "The building is being renovated at the moment.", thaiMeaning: "อาคารกำลังได้รับการปรับปรุงในขณะนี้" },
    { englishText: "If she had studied harder, she would have passed the exam.", thaiMeaning: "ถ้าเธอเรียนหนักกว่านี้ เธอจะสอบผ่าน" },
    { englishText: "I wish I could speak English fluently.", thaiMeaning: "ฉันอยากจะพูดภาษาอังกฤษได้ลื่น" },
    { englishText: "The government has implemented new policies to reduce pollution.", thaiMeaning: "รัฐบาลได้ดำเนินนโยบายใหม่เพื่อลดมลพิษ" },
    { englishText: "Despite the challenges, they persevered and achieved their goals.", thaiMeaning: "แม้จะมีความท้าทาย พวกเขาก็ยืนหยัดและบรรลุเป้าหมาย" },
    { englishText: "The conference will be attended by experts from around the world.", thaiMeaning: "การประชุมจะมีผู้เชี่ยวชาญจากทั่วโลกเข้าร่วม" },
    { englishText: "She is renowned for her contributions to science.", thaiMeaning: "เธอเป็นที่รู้จักเพราะการมีส่วนร่วมในด้านวิทยาศาสตร์" },
    { englishText: "The company's revenue has increased significantly this quarter.", thaiMeaning: "รายได้ของบริษัทเพิ่มขึ้นอย่างมีนัยสำคัญในไตรมาสนี้" },
    { englishText: "It is essential that students understand the importance of education.", thaiMeaning: "เป็นสิ่งจำเป็นที่นักเรียนต้องเข้าใจความสำคัญของการศึกษา" },
    { englishText: "The phenomenon can be attributed to climate change.", thaiMeaning: "ปรากฏการณ์นี้สามารถนำมาประกอบกับการเปลี่ยนแปลงสภาพอากาศ" },
    { englishText: "She demonstrated remarkable resilience in the face of adversity.", thaiMeaning: "เธอแสดงให้เห็นถึงความยืดหยุ่นที่โดดเด่นเมื่อเผชิญกับความลำบาก" },
    { englishText: "The proposal has been approved by the board of directors.", thaiMeaning: "ข้อเสนอได้รับการอนุมัติจากคณะกรรมการบริหาร" },
    { englishText: "Technological advancements have revolutionized the way we communicate.", thaiMeaning: "ความก้าวหน้าทางเทคโนโลยีได้ปฏิวัติวิธีการสื่อสารของเรา" }
  ],
  m5: [
    { englishText: "The implementation of sustainable practices is imperative for environmental conservation.", thaiMeaning: "การใช้ปฏิบัติการที่ยั่งยืนเป็นสิ่งจำเป็นสำหรับการอนุรักษ์สิ่งแวดล้อม" },
    { englishText: "Notwithstanding the obstacles encountered, the team persisted in their endeavor.", thaiMeaning: "แม้จะมีอุปสรรคที่พบ ทีมก็ยังคงพยายามอย่างต่อเนื่อง" },
    { englishText: "The correlation between education and socioeconomic status is well-documented.", thaiMeaning: "ความสัมพันธ์ระหว่างการศึกษาและสถานะทางสังคมเศรษฐกิจได้รับการบันทึกไว้อย่างดี" },
    { englishText: "Proponents of the theory argue that innovation drives economic growth.", thaiMeaning: "ผู้สนับสนุนทฤษฎีนี้โต้แย้งว่าการสร้างนวัตกรรมขับเคลื่อนการเติบโตทางเศรษฐกิจ" },
    { englishText: "The multifaceted nature of the problem necessitates a comprehensive approach.", thaiMeaning: "ลักษณะหลายด้านของปัญหาต้องการวิธีการที่ครอบคลุม" },
    { englishText: "Consequently, the government has initiated reforms to address systemic issues.", thaiMeaning: "ดังนั้น รัฐบาลจึงได้เริ่มต้นการปฏิรูปเพื่อแก้ไขปัญหาระบบ" },
    { englishText: "The paradigm shift in organizational management has yielded promising results.", thaiMeaning: "การเปลี่ยนแปลงแบบแพรดิจม์ในการจัดการองค์กรได้ให้ผลลัพธ์ที่สัญญาว่าจะดี" },
    { englishText: "Her scholarly contributions have significantly influenced contemporary discourse.", thaiMeaning: "การมีส่วนร่วมทางวิชาการของเธอได้มีอิทธิพลต่อการสนทนาสมัยใหม่อย่างมีนัยสำคัญ" },
    { englishText: "The empirical evidence substantiates the hypothesis proposed by the researchers.", thaiMeaning: "หลักฐานเชิงประจักษ์ยืนยันสมมติฐานที่นักวิจัยเสนอ" },
    { englishText: "Albeit challenging, the integration of new technologies has proven beneficial.", thaiMeaning: "แม้ว่าจะท้าทาย การรวมเทคโนโลยีใหม่ได้พิสูจน์แล้วว่ามีประโยชน์" },
    { englishText: "The phenomenon is attributable to a confluence of socioeconomic factors.", thaiMeaning: "ปรากฏการณ์นี้สามารถนำมาประกอบกับการบรรจบกันของปัจจัยทางสังคมเศรษฐกิจ" },
    { englishText: "Stakeholders have articulated their concerns regarding the proposed legislation.", thaiMeaning: "ผู้มีส่วนได้ส่วนเสียได้แสดงความกังวลของพวกเขาเกี่ยวกับกฎหมายที่เสนอ" },
    { englishText: "The trajectory of technological advancement necessitates ethical considerations.", thaiMeaning: "วิถีของความก้าวหน้าทางเทคโนโลยีต้องการการพิจารณาด้านจริยธรรม" },
    { englishText: "Notwithstanding the limitations, the study provides valuable insights.", thaiMeaning: "แม้จะมีข้อจำกัด การศึกษาก็ให้ข้อมูลเชิงลึกที่มีค่า" },
    { englishText: "The interdisciplinary approach facilitates a more holistic understanding of the subject.", thaiMeaning: "วิธีการข้ามสาขาวิชาอำนวยความสะดวกในการเข้าใจเรื่องที่ครอบคลุมมากขึ้น" }
  ],
  m6: [
    { englishText: "The epistemological framework underpinning this research necessitates rigorous methodological scrutiny.", thaiMeaning: "กรอบความรู้ที่เป็นพื้นฐานของการวิจัยนี้ต้องการการตรวจสอบวิธีการอย่างเข้มงวด" },
    { englishText: "Postmodern theorists contend that meaning is inherently unstable and context-dependent.", thaiMeaning: "นักทฤษฎีหลังสมัยใหม่โต้แย้งว่าความหมายนั้นไม่เสถียรและขึ้นอยู่กับบริบท" },
    { englishText: "The hegemonic discourse surrounding globalization obscures the asymmetrical power relations at play.", thaiMeaning: "วาทกรรมเด่นเกี่ยวกับโลกาภิวัตน์ปกปิดความสัมพันธ์ของอำนาจที่ไม่สมดุล" },
    { englishText: "Deconstructionist approaches interrogate the binary oppositions inherent in Western philosophical traditions.", thaiMeaning: "วิธีการถอดรหัสสอบสวนการตรงข้ามแบบไบนารีที่มีอยู่ในประเพณีปรัชญาตะวันตก" },
    { englishText: "The ontological implications of quantum mechanics challenge conventional epistemological assumptions.", thaiMeaning: "ผลกระทบด้านอนโตโลยีของกลศาสตร์ควอนตัมท้าทายสมมติฐานเชิงญาณวิทยาแบบดั้งเดิม" },
    { englishText: "Phenomenological inquiry elucidates the subjective dimensions of human experience.", thaiMeaning: "การสอบสวนปรากฏการณ์วิทยาชี้แจงมิติอัตนัยของประสบการณ์มนุษย์" },
    { englishText: "The dialectical relationship between structure and agency constitutes a fundamental problematic in sociological analysis.", thaiMeaning: "ความสัมพันธ์辯证ระหว่างโครงสร้างและหน่วยงานเป็นปัญหาพื้นฐานในการวิเคราะห์สังคมวิทยา" },
    { englishText: "Postcolonial theorists interrogate the legacies of imperialism embedded in contemporary power structures.", thaiMeaning: "นักทฤษฎีหลังอาณานิคมสอบสวนมรดกของจักรวรรดินิยมที่ฝังอยู่ในโครงสร้างอำนาจสมัยใหม่" },
    { englishText: "The aporias inherent in liberal democratic theory necessitate critical reexamination.", thaiMeaning: "ความขัดแย้งที่มีอยู่ในทฤษฎีประชาธิปไตยเสรีต้องการการตรวจสอบอย่างวิจารณญาณ" },
    { englishText: "Biosemiotics elucidates the semiotic dimensions of biological processes.", thaiMeaning: "ชีววิทยาสัญลักษณ์ชี้แจงมิติเชิงสัญลักษณ์ของกระบวนการทางชีววิทยา" },
    { englishText: "The performative aspects of identity construction challenge essentialist conceptions of selfhood.", thaiMeaning: "ด้านการแสดงของการสร้างตัวตนท้าทายแนวคิดสาระสำคัญของตัวตน" },
    { englishText: "Genealogical analysis, as articulated by Foucault, reveals the contingency of historical formations.", thaiMeaning: "การวิเคราะห์วงศ์ตระกูลตามที่ฟูโกต์กล่าวไว้ เปิดเผยความบังเอิญของการก่อตัวทางประวัติศาสตร์" },
    { englishText: "The liminal spaces between established categories afford opportunities for transgressive subjectivity.", thaiMeaning: "พื้นที่ขีดเส้นระหว่างหมวดหมู่ที่กำหนดไว้อำนวยความสะดวกสำหรับความเป็นตัวตนที่ละเมิด" },
    { englishText: "Autopoietic systems theory provides a framework for understanding organizational autonomy and adaptation.", thaiMeaning: "ทฤษฎีระบบอัตโนมัติให้กรอบสำหรับการเข้าใจความเป็นอิสระและการปรับตัวขององค์กร" },
    { englishText: "The iterative processes of signification and différance constitute the fundamental dynamics of language.", thaiMeaning: "กระบวนการซ้ำ ๆ ของการหมายความและความแตกต่างประกอบด้วยพลวัตพื้นฐานของภาษา" }
  ]
};

async function seedDatabase() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    let totalInserted = 0;
    let totalSkipped = 0;

    for (const [grade, sentences] of Object.entries(sentencesByGrade)) {
      for (const sentence of sentences) {
        try {
          // Check if sentence already exists
          const [existing] = await connection.execute(
            'SELECT id FROM sentences WHERE englishText = ? AND gradeLevel = ?',
            [sentence.englishText, grade]
          );

          if (existing.length === 0) {
            await connection.execute(
              'INSERT INTO sentences (gradeLevel, englishText, thaiMeaning) VALUES (?, ?, ?)',
              [grade, sentence.englishText, sentence.thaiMeaning]
            );
            totalInserted++;
          } else {
            totalSkipped++;
          }
        } catch (error) {
          console.error(`Error processing sentence for ${grade}:`, error.message);
        }
      }
      console.log(`✓ Processed ${sentences.length} sentences for grade ${grade}`);
    }

    console.log(`\n✅ Database seeding completed!`);
    console.log(`   - Inserted: ${totalInserted} new sentences`);
    console.log(`   - Skipped: ${totalSkipped} existing sentences`);
    console.log(`   - Total: ${totalInserted + totalSkipped} sentences`);
  } catch (error) {
    console.error('Database error:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedDatabase().catch(console.error);
