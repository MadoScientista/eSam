import { CategoryCard } from "./CategoryCard"

export function CategoryBanner({categories}){
    return (
        <>
            <div className="container">
                {categories.slice(1,4).map((c) =>{
                    return <CategoryCard category={c} />
                })}
            </div>
        </>
    )
}