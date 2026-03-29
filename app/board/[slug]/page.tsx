import { LanguageProvider } from "@/lib/i18n/context";
import { BoardClient } from "@/components/board/board-client";
import "../board.css";

type Params = { params: Promise<{ slug: string }> };

export default async function BoardPage({ params }: Params) {
  const { slug } = await params;

  return (
    <LanguageProvider>
      <BoardClient slug={slug} />
    </LanguageProvider>
  );
}
