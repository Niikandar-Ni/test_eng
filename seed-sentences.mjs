import mysql from 'mysql2/promise';

const sentences = [
  // Grade M1
  { gradeLevel: 'm1', englishText: 'Hello, my name is John.', thaiMeaning: 'สวัสดี ชื่อของฉันคือจอห์น' },
  { gradeLevel: 'm1', englishText: 'What is your name?', thaiMeaning: 'ชื่อของคุณคืออะไร?' },
  { gradeLevel: 'm1', englishText: 'Nice to meet you.', thaiMeaning: 'ยินดีที่ได้รู้จักคุณ' },
  { gradeLevel: 'm1', englishText: 'How are you today?', thaiMeaning: 'วันนี้คุณเป็นอย่างไร?' },
  { gradeLevel: 'm1', englishText: 'I am fine, thank you.', thaiMeaning: 'ฉันสบายดี ขอบคุณ' },
  { gradeLevel: 'm1', englishText: 'Where do you live?', thaiMeaning: 'คุณอาศัยอยู่ที่ไหน?' },
  { gradeLevel: 'm1', englishText: 'I live in Bangkok.', thaiMeaning: 'ฉันอาศัยอยู่ที่กรุงเทพ' },
  { gradeLevel: 'm1', englishText: 'What is your favorite color?', thaiMeaning: 'สีที่คุณชอบที่สุดคืออะไร?' },
  { gradeLevel: 'm1', englishText: 'My favorite color is blue.', thaiMeaning: 'สีที่ฉันชอบที่สุดคือสีฟ้า' },
  { gradeLevel: 'm1', englishText: 'Do you like sports?', thaiMeaning: 'คุณชอบกีฬาหรือไม่?' },

  // Grade M2
  { gradeLevel: 'm2', englishText: 'I have been studying English for two years.', thaiMeaning: 'ฉันเรียนภาษาอังกฤษมาแล้วสองปี' },
  { gradeLevel: 'm2', englishText: 'What did you do yesterday?', thaiMeaning: 'เมื่อวานคุณทำอะไร?' },
  { gradeLevel: 'm2', englishText: 'I went to the market and bought some fruits.', thaiMeaning: 'ฉันไปตลาดและซื้อผลไม้บางชนิด' },
  { gradeLevel: 'm2', englishText: 'Can you help me with my homework?', thaiMeaning: 'คุณช่วยฉันทำการบ้านได้หรือไม่?' },
  { gradeLevel: 'm2', englishText: 'Of course, I would be happy to help.', thaiMeaning: 'แน่นอน ฉันยินดีที่จะช่วย' },
  { gradeLevel: 'm2', englishText: 'What time do you usually wake up?', thaiMeaning: 'คุณมักตื่นนอนกี่โมง?' },
  { gradeLevel: 'm2', englishText: 'I usually wake up at six in the morning.', thaiMeaning: 'ฉันมักตื่นนอนเวลาหกโมงเช้า' },
  { gradeLevel: 'm2', englishText: 'Have you ever been to the beach?', thaiMeaning: 'คุณเคยไปชายหาดหรือไม่?' },
  { gradeLevel: 'm2', englishText: 'Yes, I went to the beach last summer.', thaiMeaning: 'ใช่ ฉันไปชายหาดเมื่อฤดูร้อนที่แล้ว' },
  { gradeLevel: 'm2', englishText: 'What is your dream job?', thaiMeaning: 'อาชีพในฝันของคุณคืออะไร?' },

  // Grade M3
  { gradeLevel: 'm3', englishText: 'The government has announced new policies to reduce pollution.', thaiMeaning: 'รัฐบาลได้ประกาศนโยบายใหม่เพื่อลดมลพิษ' },
  { gradeLevel: 'm3', englishText: 'Although it was raining heavily, we decided to go out.', thaiMeaning: 'แม้ว่าฝนตกหนัก แต่เราตัดสินใจออกไป' },
  { gradeLevel: 'm3', englishText: 'If I were you, I would study harder for the exam.', thaiMeaning: 'ถ้าฉันเป็นคุณ ฉันจะเรียนหนักขึ้นสำหรับสอบ' },
  { gradeLevel: 'm3', englishText: 'The teacher explained the lesson so clearly that everyone understood it.', thaiMeaning: 'ครูอธิบายบทเรียนอย่างชัดเจนจนทุกคนเข้าใจ' },
  { gradeLevel: 'm3', englishText: 'Technology has changed the way we communicate.', thaiMeaning: 'เทคโนโลยีได้เปลี่ยนวิธีการสื่อสารของเรา' },
  { gradeLevel: 'm3', englishText: 'I suggest that you should read more books to improve your vocabulary.', thaiMeaning: 'ฉันแนะนำว่าคุณควรอ่านหนังสือมากขึ้นเพื่อปรับปรุงคำศัพท์' },
  { gradeLevel: 'm3', englishText: 'Despite the difficulties, they managed to complete the project on time.', thaiMeaning: 'แม้จะมีความยากลำบาก พวกเขาก็สามารถเสร็จโครงการได้ทันเวลา' },
  { gradeLevel: 'm3', englishText: 'The reason why I love this book is because it is very inspiring.', thaiMeaning: 'เหตุผลที่ฉันรักหนังสือเล่มนี้คือมันสร้างแรงบันดาลใจมาก' },
  { gradeLevel: 'm3', englishText: 'As a result of the accident, the road was closed for several hours.', thaiMeaning: 'เป็นผลจากอุบัติเหตุ ถนนถูกปิดไปหลายชั่วโมง' },
  { gradeLevel: 'm3', englishText: 'In order to succeed, one must work hard and never give up.', thaiMeaning: 'เพื่อให้ประสบความสำเร็จ เราต้องทำงานหนักและไม่ยอมแพ้' },

  // Grade M4
  { gradeLevel: 'm4', englishText: 'The phenomenon of climate change has become increasingly evident in recent years.', thaiMeaning: 'ปรากฏการณ์การเปลี่ยนแปลงสภาพภูมิอากาศได้กลายเป็นที่ชัดเจนมากขึ้นในปีที่ผ่านมา' },
  { gradeLevel: 'm4', englishText: 'The implementation of sustainable development requires cooperation from all sectors.', thaiMeaning: 'การนำการพัฒนาที่ยั่งยืนไปใช้ต้องการความร่วมมือจากทุกภาค' },
  { gradeLevel: 'm4', englishText: 'The correlation between education and economic growth is well-established.', thaiMeaning: 'ความสัมพันธ์ระหว่างการศึกษาและการเติบโตทางเศรษฐกิจได้รับการยืนยันแล้ว' },
  { gradeLevel: 'm4', englishText: 'To mitigate the effects of urbanization, cities should prioritize green spaces.', thaiMeaning: 'เพื่อลดผลกระทบของการขยายตัวของเมือง เมืองควรให้ความสำคัญกับพื้นที่สีเขียว' },
  { gradeLevel: 'm4', englishText: 'The advancement of artificial intelligence has revolutionized various industries.', thaiMeaning: 'ความก้าวหน้าของปัญญาประดิษฐ์ได้ปฏิวัติอุตสาหกรรมต่างๆ' },
  { gradeLevel: 'm4', englishText: 'Globalization has created both opportunities and challenges for developing nations.', thaiMeaning: 'โลกาภิวัตน์ได้สร้างโอกาสและความท้าทายสำหรับประเทศกำลังพัฒนา' },
  { gradeLevel: 'm4', englishText: 'The preservation of cultural heritage is essential for maintaining national identity.', thaiMeaning: 'การอนุรักษ์มรดกวัฒนธรรมเป็นสิ่งจำเป็นสำหรับการรักษาเอกลักษณ์ของชาติ' },
  { gradeLevel: 'm4', englishText: 'The effectiveness of public policies depends on their implementation and monitoring.', thaiMeaning: 'ประสิทธิผลของนโยบายสาธารณะขึ้นอยู่กับการนำไปใช้และการติดตาม' },
  { gradeLevel: 'm4', englishText: 'The integration of renewable energy sources is crucial for environmental sustainability.', thaiMeaning: 'การรวมแหล่งพลังงานหมุนเวียนเป็นสิ่งสำคัญสำหรับความยั่งยืนของสิ่งแวดล้อม' },
  { gradeLevel: 'm4', englishText: 'The emergence of social media has transformed communication patterns worldwide.', thaiMeaning: 'การเกิดขึ้นของสื่อสังคมได้เปลี่ยนรูปแบบการสื่อสารทั่วโลก' },

  // Grade M5
  { gradeLevel: 'm5', englishText: 'The epistemological implications of quantum mechanics challenge our conventional understanding of reality.', thaiMeaning: 'ความหมายทางญาณวิทยาของกลศาสตร์ควอนตัมท้าทายความเข้าใจแบบดั้งเดิมของเราเกี่ยวกับความเป็นจริง' },
  { gradeLevel: 'm5', englishText: 'The proliferation of misinformation in digital media necessitates critical media literacy.', thaiMeaning: 'การแพร่ระบาดของข้อมูลที่ไม่ถูกต้องในสื่อดิจิทัลต้องการการรู้หนังสือด้านสื่อที่มีวิจารณญาณ' },
  { gradeLevel: 'm5', englishText: 'The dichotomy between individual rights and collective welfare remains a fundamental tension in democratic societies.', thaiMeaning: 'ความขัดแย้งระหว่างสิทธิของบุคคลและสวัสดิการส่วนรวมยังคงเป็นความตึงเครียดพื้นฐานในสังคมประชาธิปไตย' },
  { gradeLevel: 'm5', englishText: 'The paradigm shift towards interdisciplinary research has yielded unprecedented insights into complex phenomena.', thaiMeaning: 'การเปลี่ยนแปลงแบบจำลองไปสู่การวิจัยแบบสหวิทยาการได้ให้ผลลัพธ์ที่ไม่เคยมีมาก่อนในการเข้าใจปรากฏการณ์ที่ซับซ้อน' },
  { gradeLevel: 'm5', englishText: 'The exacerbation of socioeconomic disparities has precipitated a crisis of social cohesion.', thaiMeaning: 'การทำให้ความไม่เท่าเทียมทางสังคมเศรษฐกิจรุนแรงขึ้นได้ก่อให้เกิดวิกฤตการณ์ของความสามัคคีทางสังคม' },
  { gradeLevel: 'm5', englishText: 'The confluence of technological innovation and regulatory frameworks determines the trajectory of digital transformation.', thaiMeaning: 'การบรรจบกันของนวัตกรรมเทคโนโลยีและกรอบการควบคุมกำหนดวิถีของการเปลี่ยนแปลงดิจิทัล' },
  { gradeLevel: 'm5', englishText: 'The hermeneutic approach to textual analysis reveals the multivalent meanings embedded within cultural artifacts.', thaiMeaning: 'วิธีการตีความข้อความเผยให้เห็นความหมายที่หลากหลายที่ฝังตัวอยู่ในสิ่งประดิษฐ์ทางวัฒนธรรม' },
  { gradeLevel: 'm5', englishText: 'The ontological status of abstract entities continues to generate philosophical debate.', thaiMeaning: 'สถานะออนโทโลยีของสิ่งที่เป็นนามธรรมยังคงสร้างการถกเถียงทางปรัชญา' },
  { gradeLevel: 'm5', englishText: 'The teleological interpretation of history has been largely superseded by more nuanced analytical frameworks.', thaiMeaning: 'การตีความประวัติศาสตร์แบบเป้าหมายนิยมได้ถูกแทนที่ด้วยกรอบการวิเคราะห์ที่ละเอียดอ่อนมากขึ้น' },
  { gradeLevel: 'm5', englishText: 'The apotheosis of consumer capitalism has engendered unprecedented levels of material accumulation and environmental degradation.', thaiMeaning: 'จุดสูงสุดของทุนนิยมผู้บริโภคได้ก่อให้เกิดการสะสมวัสดุและการเสื่อมสภาพสิ่งแวดล้อมในระดับที่ไม่เคยมีมาก่อน' },

  // Grade M6
  { gradeLevel: 'm6', englishText: 'The metanarrative of progress has been deconstructed by postmodern theorists who emphasize the contingency of historical trajectories.', thaiMeaning: 'อุปมหาวรรณนาของความก้าวหน้าได้ถูกถอดแบบโดยนักทฤษฎีหลังสมัยใหม่ที่เน้นความสัญญาณของวิถีประวัติศาสตร์' },
  { gradeLevel: 'm6', englishText: 'The hegemonic discourse surrounding neoliberal economics has obscured alternative modes of economic organization and distribution.', thaiMeaning: 'วาทกรรมเด่นเกี่ยวกับเศรษฐศาสตร์เสรีนิยมใหม่ได้ปิดบังรูปแบบทางเลือกของการจัดการและการจัดจำหน่ายทางเศรษฐกิจ' },
  { gradeLevel: 'm6', englishText: 'The aporias inherent in foundationalist epistemology necessitate a reconsideration of the grounds for knowledge claims.', thaiMeaning: 'ความขัดแย้งที่มีอยู่ในญาณวิทยาแบบรากฐานนิยมต้องการการพิจารณาใหม่ของพื้นฐานสำหรับการอ้างสิทธิ์ความรู้' },
  { gradeLevel: 'm6', englishText: 'The phenomenological reduction reveals the intentional structures underlying consciousness and perception.', thaiMeaning: 'การลดปรากฏการณ์เผยให้เห็นโครงสร้างที่มีจุดมุ่งหมายที่อยู่เบื้องหลังจิตสำนึกและการรับรู้' },
  { gradeLevel: 'm6', englishText: 'The genealogical method employed by Foucault traces the contingent origins of seemingly natural categories and institutions.', thaiMeaning: 'วิธีการทางชีววิทยาที่ฟูโกต์ใช้ติดตามต้นกำเนิดที่เป็นไปได้ของหมวดหมู่และสถาบันที่ดูเหมือนเป็นธรรมชาติ' },
  { gradeLevel: 'm6', englishText: 'The performative constitution of identity challenges essentialist understandings of selfhood and subjectivity.', thaiMeaning: 'การก่อตัวของตัวตนแบบการแสดงท้าทายความเข้าใจแบบสาระสำคัญของตัวตนและความเป็นตัวตน' },
  { gradeLevel: 'm6', englishText: 'The biopolitical governance of populations through mechanisms of surveillance and control exemplifies the contemporary exercise of power.', thaiMeaning: 'การปกครองแบบชีววิทยาการเมืองของประชากรผ่านกลไกการเฝ้าระวังและการควบคุมเป็นตัวอย่างของการใช้อำนาจในสมัยใหม่' },
  { gradeLevel: 'm6', englishText: 'The spectral hauntings of historical trauma persist in the contemporary moment, resisting narrative closure and reconciliation.', thaiMeaning: 'การหลอกหลวงของสิ่งที่เป็นวิญญาณของความเจ็บปวดทางประวัติศาสตร์ยังคงอยู่ในช่วงเวลาปัจจุบัน ต่อต้านการปิดปากและการปรองดอง' },
  { gradeLevel: 'm6', englishText: 'The rhizomatic structure of knowledge networks resists hierarchical organization and enables non-linear modes of understanding.', thaiMeaning: 'โครงสร้างแบบรากของเครือข่ายความรู้ต่อต้านการจัดระเบียบแบบลำดับชั้นและเปิดใจให้มีรูปแบบการเข้าใจแบบไม่เป็นเชิงเส้น' },
  { gradeLevel: 'm6', englishText: 'The alterity of the Other, as theorized by Levinas, escapes the totalizing logic of Western metaphysics and ethics.', thaiMeaning: 'ความแตกต่างของผู้อื่น ตามที่เลวินาสทฤษฏี หลบหนีจากตรรกะการรวมทั้งหมดของอภิปรัชญาและจริยธรรมตะวันตก' },
];

async function seedDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST || 'localhost',
      user: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME || 'english_learning_app',
    });

    console.log('Connected to database');

    // Check if sentences already exist
    const [existingSentences] = await connection.query(
      'SELECT COUNT(*) as count FROM sentences'
    );

    if (existingSentences[0].count > 0) {
      console.log(`Database already has ${existingSentences[0].count} sentences. Skipping seed.`);
      await connection.end();
      return;
    }

    // Insert sentences
    for (const sentence of sentences) {
      await connection.query(
        'INSERT INTO sentences (gradeLevel, englishText, thaiMeaning) VALUES (?, ?, ?)',
        [sentence.gradeLevel, sentence.englishText, sentence.thaiMeaning]
      );
    }

    console.log(`Successfully inserted ${sentences.length} sentences`);
    await connection.end();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
