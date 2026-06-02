import { Link } from "react-router-dom"


const DocDirector = () => {
  return (
    <div className='flex items-center justify-center gap-4'>
        <Link to="/documentation/javascript">JavaScript</Link>
        <Link to="/documentation/postgresql">PostgreSQL</Link>
        <Link to="/documentation/tailwind">Tailwind CSS</Link>
    </div>
  )
}

export default DocDirector