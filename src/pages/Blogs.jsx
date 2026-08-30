import { BlogCard } from "../components/BlogCard";
import { entradasBlog } from "../const/entradasBlog"


export function Blogs(){
    return (
        <div className="container mt-5 mb-5">
            <h2 className="mb-5">Entradas Blog</h2>
            {entradasBlog.map((b)=>{
                return (
                    <div className="border-bottom">
                        <BlogCard entrada={b}/>
                    </div>
                )
            })}
        </div>
    )
}