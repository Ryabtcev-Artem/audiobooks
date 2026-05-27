import { Link } from 'react-router-dom';
import { bookCountText } from '../utils/ruPlural';

export default function CatalogIndexList({ items, basePath, ariaLabel }) {
  return (
    <ul className="catalog-index" role="list" aria-label={ariaLabel}>
      {items.map(({ name, count }) => (
        <li key={name} className="catalog-index__item">
          <Link
            to={`${basePath}/${encodeURIComponent(name)}`}
            className="catalog-index__link"
            aria-label={`${name}, ${bookCountText(count)}`}
          >
            <span className="catalog-index__name">{name}</span>
            <span className="catalog-index__count" aria-hidden="true">
              {bookCountText(count)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
