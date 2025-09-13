import {
  embed,
  streamText
} from 'ai';
import {
  createOpenAI
} from '@ai-sdk/openai';
import {
  createClient
} from '@supabase/supabase-js';
// import "dotenv/config";

const supabase = createClient(
  process.env.SUPABASE_URL??"",
  process.env.SUPABASE_ANON_KEY??""
);

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL,
})

async function generateEmbedding(message: string) {
  return embed({
    model: openai.embedding('text-embedding-3-small'),
    value: message
  })
}

async function fetchRelevantContext(embedding: number[]) {
  console.log('=== 开始调用 RPC 函数 ===');
  console.log('Embedding 长度:', embedding.length);
  console.log('Embedding 前5个值:', embedding.slice(0, 5));
  
  const { data, error } = await supabase.rpc("get_relevant_chunks", {
    query_vector: embedding,
    match_threshold: 0.2,
    match_count: 6
  });
  
  console.log('=== RPC 调用结果 ===');
  console.log('Error:', error);
  console.log('Data:', data);
  console.log('Data type:', typeof data);
  console.log('Data length:', data?.length);
  
  if (error) {
    console.error('Supabase RPC 错误详情:', JSON.stringify(error, null, 2));
    throw error;
  }
  
  console.log(data, '////////////////');
  return JSON.stringify(
    data.map((item:any) => `
      Source: ${item.url},
      Date Updated: ${item.date_updated}
      Content: ${item.content}  
    `)
  )
}

const createPrompt = (context: string, userQuestion: string) => {
  return {
    role: "system",
    content: `
      你是 DJI-DroneMind，一个专业的 DJI 无人机技术助手。你专门提供关于 DJI 无人机产品的详细技术信息和专业建议。
      
      请基于以下知识库内容回答用户问题：
      ----------------
      知识库内容开始
      ${context}
      知识库内容结束
      ----------------
      
      回答要求：
      1. 使用 Markdown 格式回答，包含相关链接和信息更新日期
      2. 重点关注技术参数、规格、性能指标等专业信息
      3. 如果知识库信息不足，可以基于你的专业知识补充，但请明确标注这些信息可能不是最新的
      4. 如果用户询问与 DJI 无人机无关的问题，请礼貌地告知你只能回答 DJI 无人机相关问题
      5. 对于技术参数问题，请提供准确的数值和单位
      6. 如果涉及飞行安全，请提醒用户遵守当地法规
      
      专业领域包括但不限于：
      - DJI 各系列无人机技术规格（Mavic、Air、Mini、Phantom 等）
      - 飞行性能参数（续航、飞行距离、最大速度等）
      - 摄像头规格（分辨率、帧率、传感器等）
      - 云台稳定技术
      - 智能飞行功能
      - 安全功能和避障系统
      - 遥控器和传输技术
      
      ----------------
      用户问题：${userQuestion}
      ----------------
    `
  }
}

// 将机型名称转换为知识库格式：小写+连字符，移除DJI前缀
function normalizeDroneModelInText(text: string): string {
  // 常见的DJI机型模式匹配（不区分大小写，包含DJI前缀）
  const dronePatterns = [
    /dji\s*mavic\s*4\s*pro/gi,
    /dji\s*mavic\s*3\s*pro/gi,
    /dji\s*mavic\s*3\s*classic/gi,
    /dji\s*mavic\s*3/gi,
    /dji\s*mini\s*4\s*pro/gi,
    /dji\s*mini\s*3/gi,
    /dji\s*air\s*3s/gi,
    /dji\s*air\s*3/gi,
    /dji\s*air\s*2s/gi,
    /dji\s*neo/gi,
    /dji\s*inspire\s*3/gi,
    /dji\s*inspire\s*2/gi,
    /dji\s*avata\s*2/gi,
    /dji\s*phantom\s*4/gi,
    /dji\s*phantom\s*3/gi,
    // 也匹配没有DJI前缀的情况
    /mavic\s*4\s*pro/gi,
    /mavic\s*3\s*pro/gi,
    /mavic\s*3\s*classic/gi,
    /mavic\s*3/gi,
    /mini\s*4\s*pro/gi,
    /mini\s*3/gi,
    /air\s*3s/gi,
    /air\s*3/gi,
    /air\s*2s/gi,
    /neo/gi,
    /inspire\s*3/gi,
    /inspire\s*2/gi,
    /avata\s*2/gi,
    /phantom\s*4/gi,
    /phantom\s*3/gi
  ];
  
  let normalizedText = text;
  
  // 替换所有匹配的机型名称为知识库格式
  dronePatterns.forEach(pattern => {
    normalizedText = normalizedText.replace(pattern, (match) => {
      // 移除DJI前缀，转换为小写，空格替换为连字符
      let model = match.toLowerCase().replace(/^dji\s*/i, '').trim();
      model = model.replace(/\s+/g, '-');
      return model;
    });
  });
  
  return normalizedText;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages.at(-1).content;
    
    // 只转换机型名称（英文部分）为小写，保持中文不变
    const normalizedMessage = normalizeDroneModelInText(latestMessage);
    console.log('原始输入:', latestMessage);
    console.log('标准化输入:', normalizedMessage);
    
    // embedding
    const { embedding } = await generateEmbedding(normalizedMessage);
    // console.log(embedding);
    // 相似度计算
    const context = await fetchRelevantContext(embedding);
    const prompt = createPrompt(context, latestMessage);
    console.log(prompt);
    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: [prompt, ...messages]
    })

     // 关键：必须返回 Response
    return result.toDataStreamResponse();
  } catch(err) {
  console.error('POST 处理错误:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}