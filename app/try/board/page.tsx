import { GuestBoard } from "@/components/guest/guest-board";
import { LanguageProvider } from "@/lib/i18n/context";
import "../../board/board.css";

export default function GuestBoardPage() {
  return (
    <LanguageProvider>
      <GuestBoard />
    </LanguageProvider>
  );
}
