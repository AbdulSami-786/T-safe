import Reviews from '../components/Reviews';
import { useSeo } from '../hooks/usePageTitle';

export default function ReviewsPage() {
  useSeo('/reviews');
  return (
    <div className="page-reviews">
      <Reviews page />
    </div>
  );
}
