import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '../services/api';

function MyPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/policies')
      .then(({ data }) => setPolicies(data.policies ?? []))
      .catch(() => setError('Не удалось загрузить полисы'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Card className="!gap-0 overflow-hidden rounded-2xl !py-0 shadow-sm">
        <CardHeader className="border-b border-border/70 bg-gradient-to-r from-teal-50/80 to-background px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 shadow-sm">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">Мои полисы</CardTitle>
              <p className="mt-1.5 text-sm text-muted-foreground">Все оформленные полисы в одном месте.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="!px-0">
          {loading && <p className="px-6 py-10 text-center text-muted-foreground">Загрузка...</p>}
          {error && <p className="m-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}
          {!loading && !error && policies.length === 0 && (
            <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ShieldCheck className="size-5" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Оплаченных полисов пока нет.</p>
            </div>
          )}
          {!loading && !error && policies.length > 0 && (
            <div className="overflow-x-auto">
            <table className="crm-table w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-muted/50 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  <th className="px-6 py-3.5">ID полиса</th>
                  <th className="px-6 py-3.5">Номер полиса</th>
                  <th className="px-6 py-3.5">Тип страхования</th>
                  <th className="px-6 py-3.5">Премия</th>
                  <th className="px-6 py-3.5">Статус</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy.id} className="border-b border-border/60 transition-colors hover:bg-teal-50/50 last:border-0">
                    <td className="px-6 py-4">
                      <Link to={`/policies/${policy.id}`} className="inline-flex h-8 items-center rounded-lg bg-teal-50 px-2.5 text-xs font-semibold tabular-nums text-teal-700 ring-1 ring-inset ring-teal-200 transition-colors hover:bg-teal-100 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500">
                        #{policy.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-medium">{policy.policy_number}</td>
                    <td className="px-6 py-4 text-muted-foreground">{policy.application?.insurance_type?.name ?? '—'}</td>
                    <td className="px-6 py-4 font-semibold tabular-nums">{policy.premium} MDL</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full border border-[#BBDCCF] bg-[#EDF8F2] px-2.5 py-1 text-xs font-medium text-[#327155]">
                        Оплачено
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default MyPolicies;
