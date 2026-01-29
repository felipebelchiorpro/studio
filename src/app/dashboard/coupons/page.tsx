import { getCoupons } from '@/actions/coupons';
import { getPartners } from '@/actions/partners';
import CouponManager from '@/components/dashboard/CouponManager';

export default async function CouponsPage() {
    const coupons = await getCoupons();
    const partners = await getPartners();

    return (
        <div className="container mx-auto py-6">
            <CouponManager initialCoupons={coupons} partners={partners} />
        </div>
    );
}
