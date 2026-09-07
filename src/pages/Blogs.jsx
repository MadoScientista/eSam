import { BlogCard } from "../components/BlogCard";
import { entradasBlog } from "../const/entradasBlog"


export function Blogs(){
    return (
        <div className="container pt-5 pb-5">
            <div className="col-lg-8 mx-auto text-center mb-5">
                <h2 className="mb-3">Blog</h2>
                <p className="lead text-secondary mb-0">
                    Consejos y trucos para aprovechar mejor tus útiles escolares
                    y cuidar tus materiales durante todo el año.
                </p>
            </div>

            <div className="row g-4">
                {entradasBlog.map((b) => (
                    <div className="col-md-6 d-flex" key={b.id}>
                        <BlogCard entrada={b}/>
                    </div>
                ))}
            </div>
        </div>
    )
}