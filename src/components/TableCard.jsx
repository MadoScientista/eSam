export function TableCard({ title, subtitle, toolbar, children }) {
    const tieneEncabezado = Boolean(title || subtitle || toolbar)

    return (
        <section className="site-table-card">
            {tieneEncabezado && (
                <div className="site-table-heading">
                    <div className="site-table-heading-copy">
                        {title && <h2>{title}</h2>}
                        {subtitle && <p>{subtitle}</p>}
                    </div>
                    {toolbar && <div className="site-table-toolbar">{toolbar}</div>}
                </div>
            )}
            <div className="table-responsive">
                {children}
            </div>
        </section>
    )
}
