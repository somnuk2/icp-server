import axios from 'axios';

const baseUrl = 'https://icp.sif.or.th/api';

// This script tests the AI's ability to help with the workflow steps.
// It simulates the prompts used by the frontend.

async function testAIWorkflow() {
    console.log('--- Starting AI Workflow Test ---');
    
    const profile = `
โปรไฟล์นักเรียน (ICP Scorecard):
- ชื่อ: นายสมชาย
- มาจากจังหวัด: เชียงใหม่
- ภาวะความพิการ: ไม่มี
- เรียนสาย: วิทย์-คณิต
- วิชาที่ชอบ: คอมพิวเตอร์, ภาษาอังกฤษ
- อุปกรณ์ที่จำเป็น: -
- กิจกรรมที่ชอบทำ: เขียนโปรแกรม, เล่นกีฬา
- ความถนัด / ความชำนาญ: JavaScript, Python
- อาชีพที่ใฝ่ฝัน: Software Engineer
- ภาค/จังหวัดที่อยากอยู่ระหว่างเรียน: กรุงเทพฯ
- ข้อมูลเพิ่มเติม: -
`.trim();

    const testSteps = [
        {
            name: 'Career Plan AI',
            prompt: `${profile}\n\nคำขอจากครู: ช่วยเสนอแนะอาชีพจำนวน 3 อาชีพ`
        },
        {
            name: 'Qualification AI (Skills for Software Engineer)',
            prompt: `${profile}\n\nอาชีพ: Software Engineer\n\nกรุณาระบุทักษะสำคัญ 4 ข้อที่จำเป็นสำหรับอาชีพนี้ โดยตอบเฉพาะชื่อทักษะเท่านั้น`
        },
        {
            name: 'Development Plan AI',
            prompt: `${profile}\n\nช่วยเสนอวิธีพัฒนาทักษะต่อไปนี้ให้กับนักเรียน: Coding Skills\n\nเงื่อนไข: เสนอ 3 วิธีที่ทำได้จริง`
        },
        {
            name: 'Self Assessment AI (Target/Current Level)',
            prompt: `${profile}\n\nอาชีพ: Software Engineer\nทักษะ: Coding Skills\n\nกรุณาให้ข้อมูลดังนี้:\n1) ระดับเป้าหมายที่ควรมี\n2) ระดับปัจจุบันของนักเรียน`
        }
    ];

    for (const step of testSteps) {
        console.log(`\nTesting: ${step.name}...`);
        try {
            const res = await axios.post(`${baseUrl}/chat`, {
                messages: [{ role: 'user', content: step.prompt }]
            });
            
            if (res.data.provider !== 'gemini') {
                console.error(`   ❌ Failed: Expected gemini but got ${res.data.provider}`);
            } else {
                console.log(`   ✅ Success: [Provider: ${res.data.provider}]`);
                console.log(`   Reply: ${res.data.reply.substring(0, 100)}...`);
            }
        } catch (err) {
            console.error(`   Failed: ${step.name}`);
            if (err.response) console.error(`   Error: ${JSON.stringify(err.response.data)}`);
            else console.error(`   Error: ${err.message}`);
        }
    }

    console.log('\n--- AI Workflow Test Completed ---');
}

testAIWorkflow();
