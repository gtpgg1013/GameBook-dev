import { BookStage } from "./components/BookStage"
import { getPageById } from "./game/navigation"
import { useReaderStore } from "./game/store"
import "./styles/global.css"

export function App() {
  const currentPageId = useReaderStore((state) => state.currentPageId)
  const page = getPageById(currentPageId)
  return <BookStage page={page} />
}
