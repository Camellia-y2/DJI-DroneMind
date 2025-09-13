import { createOpenAI } from "@ai-sdk/openai"
// langchain loader 是RAG的基础功能 txt,pdf,excel...
// 加载网页内容
import {
    PuppeteerWebBaseLoader,
} from "@langchain/community/document_loaders/web/puppeteer";
import {
  RecursiveCharacterTextSplitter
} from 'langchain/text_splitter';
import {
  embed // 向量嵌入
} from 'ai';
import "dotenv/config";
import { createClient } from '@supabase/supabase-js';

// ?? 空合并运算符
const supabase = createClient(
  process.env.SUPABASE_URL??"",
  process.env.SUPABASE_ANON_KEY??""
)

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL,
})

// supabase 去做向量化的知识库数据
console.log("开始向量化知识库数据爬取");

// 知识库构建
const scrapePage = async (url: string, retries: number = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`尝试第 ${attempt} 次爬取: ${url}`);

      // 使用 Puppeteer 爬取网页内容
      const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
          executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        },
        gotoOptions: {
          waitUntil: 'networkidle0',
          timeout: 60000, // 增加超时时间到60秒
        },
        evaluate: async(page, browser) => {
          const result = await page.evaluate(() => document.body.innerHTML);
          await browser.close();
          return result;
        }
      });
      
      return await loader.scrape();
    } catch (error) {
      console.error(`第 ${attempt} 次爬取失败:`, error);
      if (attempt === retries) {
        throw error;
      }
      // 等待一段时间后重试
      console.log(`等待 ${2 * attempt} 秒后重试...`);
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
  
  throw new Error(`所有重试都失败了`);
}

const loadData = async (webpages: string[]) => {
    // 创建递归文本分割器
    // 将爬虫爬取到的网页内容进行递归分割
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 512, //切割的长度512个字符，包含一个比较独立的语意
      chunkOverlap: 100, // 相邻文本块重叠100字符（保持上下文连贯性）
      separators: ['\n\n', '\n', ' ', ''], // 递归分割的分隔符优先级
    });

    for (const url of webpages) {
      console.log(`正在爬取: ${url}`);
      const content = await scrapePage(url);
      console.log(`爬取完成: ${url}, 内容长度: ${content.length}`);
      
      const chunks = await splitter.splitText(content);

      for (let chunk of chunks){
      const { embedding } = await embed({
        model: openai.embedding('text-embedding-3-small'),
        value: chunks[0]
      })
      console.log('向量'+embedding);

      const {error} = await supabase.from('djichunks').insert({
        content: chunks[0],
        vector: embedding,
        url: url
      })
      if(error){
          console.log(error)
      }
      }
    }
}

// 知识库的来源，可配置
loadData([
  "https://www.dji.com/cn/mavic-4-pro/specs",
]);