export function Breadcrumbs({
  items,
}: {
  items: { name: string; href?: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="breadcrumb">
      <ol>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.name} aria-current={isLast ? "page" : undefined}>
              {item.href && !isLast ? (
                <a href={item.href}>{item.name}</a>
              ) : (
                <span>{item.name}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
