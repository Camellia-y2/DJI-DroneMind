-- =====================================================
-- DJI-DroneMind 快速设置 SQL

-- 启用扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 创建主表
CREATE TABLE public.djichunks (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    content text NOT NULL,
    vector vector(1536) NULL,
    url text NULL,
    date_updated timestamp without time zone DEFAULT now(),
    CONSTRAINT chunks_pkey PRIMARY KEY (id)
);

-- 创建向量索引
CREATE INDEX djichunks_vector_idx ON public.djihunks USING hnsw (vector vector_cosine_ops);

-- 创建相似度搜索函数
CREATE OR REPLACE FUNCTION get_relevant_chunks(
    query_vector vector(1536),
    match_threshold float DEFAULT 0.5,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id uuid,
    content text,
    url text,
    date_updated timestamp,
    similarity float
)
LANGUAGE sql STABLE
AS $$
    SELECT
        id,
        content,
        url,
        date_updated,
        1 - (djichunks.vector <=> query_vector) as similarity
    FROM djichunks
    WHERE 1 - (djichunks.vector <=> query_vector) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
$$;