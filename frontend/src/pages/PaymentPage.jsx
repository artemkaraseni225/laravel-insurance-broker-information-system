
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

export default function PaymentPage() {
    const navigate = useNavigate();
    const { policyId } = useParams();

    const [formData, setFormData] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
    });

    const [errors, setErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const [policy, setPolicy] = useState(null);
    const [isLoadingPolicy, setIsLoadingPolicy] = useState(true);
    const [policyError, setPolicyError] = useState(null);

    useEffect(() => {
        api
            .get(`/applications/${policyId}`)
            .then(({ data }) => {
                const application = data.application;

                setPolicy({
                    id: application.id,
                    insuranceType: application.insurance_type?.name ?? '—',
                    premium: application.calculated_price,
                    currency: 'MDL',
                    status: application.status,
                    policyStatus: application.policy?.status ?? 'pending_payment',
                });
            })
            .catch(() => setPolicyError('Не удалось загрузить данные полиса'))
            .finally(() => setIsLoadingPolicy(false));
    }, [policyId]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: '',
        }));
    };

    const formatCardNumber = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 16);

        return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    };

    const formatExpiryDate = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 4);

        if (digits.length >= 3) {
            return `${digits.slice(0, 2)}/${digits.slice(2)}`;
        }

        return digits;
    };

    const validate = () => {
        const newErrors = {};

        const cardNumber = formData.cardNumber.replace(/\s/g, '');

        if (!cardNumber) {
            newErrors.cardNumber = 'Введите номер карты';
        } else if (cardNumber.length !== 16) {
            newErrors.cardNumber = 'Номер карты должен содержать 16 цифр';
        }

        if (!formData.cardHolder.trim()) {
            newErrors.cardHolder = 'Введите имя держателя карты';
        }

        if (!formData.expiryDate) {
            newErrors.expiryDate = 'Введите срок действия карты';
        } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
            newErrors.expiryDate = 'Используйте формат MM/YY';
        }

        if (!formData.cvv) {
            newErrors.cvv = 'Введите CVV';
        } else if (!/^\d{3}$/.test(formData.cvv)) {
            newErrors.cvv = 'CVV должен содержать 3 цифры';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setIsProcessing(true);

        api
            .post(`/applications/${policyId}/pay`)
            .then(({ data }) => {
                setPolicy((current) => ({
                    ...current,
                    policyStatus: data.policy.status,
                }));
                setIsPaid(true);
            })
            .catch((error) => {
                setErrors({
                    general: error.response?.data?.message ?? 'Не удалось провести оплату',
                });
            })
            .finally(() => setIsProcessing(false));
    };

    if (isLoadingPolicy) {
        return <p className="page-shell text-center text-muted-foreground">Загрузка данных полиса...</p>;
    }

    if (policyError || !policy) {
        return (
            <div className="page-shell text-center">
                <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-destructive">{policyError ?? 'Полис не найден'}</p>
                <button type="button" onClick={() => navigate(-1)} className="mt-4 text-sm font-medium text-primary underline underline-offset-4">
                    Назад
                </button>
            </div>
        );
    }

    if (isPaid) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <div className="w-full max-w-md rounded-xl border border-border/80 bg-card p-8 text-center shadow-sm">
                    <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-primary/10">
                        <svg
                            className="size-8 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>

                    <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
                        Оплата прошла успешно
                    </h1>

                    <p className="mb-6 text-muted-foreground">
                        Полис {policy.id} успешно оплачен.
                    </p>

                    <div className="mb-6 space-y-3 rounded-lg border border-border/70 bg-muted/35 p-4 text-left">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Полис</span>
                            <span className="font-medium text-foreground">
                                {policy.id}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Страхование</span>
                            <span className="font-medium text-foreground">
                                {policy.insuranceType}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Сумма</span>
                            <span className="font-semibold text-foreground">
                                {policy.premium} {policy.currency}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/my-policies')}
                        className="w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground transition hover:bg-primary/90"
                    >
                        Перейти к моим полисам
                    </button>
                    <button
                        type="button"
                        disabled
                        className="mt-3 w-full rounded-lg bg-primary/10 py-3 font-medium text-primary"
                    >
                        Оплачено
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background px-4 py-8 sm:py-10">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-4 text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                        ← Назад
                    </button>

                    <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                        Оплата страхового полиса
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        Проверьте и введите данные банковской карты.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Payment form */}
                    <div className="lg:col-span-2">
                        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">

                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground sm:text-xl">
                                        Данные карты
                                    </h2>

                                </div>

                                <div className="text-sm font-medium text-muted-foreground">
                                    🔒 Secure
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>

                                {/* Card number */}
                                <div className="mb-5">
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        Номер карты
                                    </label>

                                    <input
                                        type="text"
                                        name="cardNumber"
                                        value={formData.cardNumber}
                                        onChange={(e) =>
                                            handleChange({
                                                target: {
                                                    name: 'cardNumber',
                                                    value: formatCardNumber(e.target.value),
                                                },
                                            })
                                        }
                                        placeholder="1234 5678 9012 3456"
                                        className={`w-full px-4 py-3 rounded-xl border ${
                                            errors.cardNumber
                                                ? 'border-destructive'
                                                : 'border-input'
                                            } bg-card shadow-xs focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/30`}
                                    />

                                    {errors.cardNumber && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.cardNumber}
                                        </p>
                                    )}
                                </div>

                                {/* Card holder */}
                                <div className="mb-5">
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        Имя держателя карты
                                    </label>

                                    <input
                                        type="text"
                                        name="cardHolder"
                                        value={formData.cardHolder}
                                        onChange={handleChange}
                                        placeholder="ARTIOM CARASENI"
                                        className={`w-full px-4 py-3 rounded-xl border ${
                                            errors.cardHolder
                                                ? 'border-destructive'
                                                : 'border-input'
                                            } bg-card shadow-xs focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/30`}
                                    />

                                    {errors.cardHolder && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.cardHolder}
                                        </p>
                                    )}
                                </div>

                                {/* Expiry + CVV */}
                                <div className="grid grid-cols-2 gap-4 mb-6">

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            Срок действия
                                        </label>

                                        <input
                                            type="text"
                                            name="expiryDate"
                                            value={formData.expiryDate}
                                            onChange={(e) =>
                                                handleChange({
                                                    target: {
                                                        name: 'expiryDate',
                                                        value: formatExpiryDate(e.target.value),
                                                    },
                                                })
                                            }
                                            placeholder="MM/YY"
                                            className={`w-full px-4 py-3 rounded-xl border ${
                                                errors.expiryDate
                                                        ? 'border-destructive'
                                                        : 'border-input'
                                                    } bg-card shadow-xs focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/30`}
                                        />

                                        {errors.expiryDate && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.expiryDate}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            CVV
                                        </label>

                                        <input
                                            type="password"
                                            name="cvv"
                                            value={formData.cvv}
                                            onChange={(e) =>
                                                handleChange({
                                                    target: {
                                                        name: 'cvv',
                                                        value: e.target.value
                                                            .replace(/\D/g, '')
                                                            .slice(0, 3),
                                                    },
                                                })
                                            }
                                            placeholder="123"
                                            className={`w-full px-4 py-3 rounded-xl border ${
                                                errors.cvv
                                                        ? 'border-destructive'
                                                        : 'border-input'
                                                    } bg-card shadow-xs focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/30`}
                                        />

                                        {errors.cvv && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.cvv}
                                            </p>
                                        )}
                                    </div>

                                </div>

                                <button
                                    type="submit"
                                    disabled={isProcessing || policy.policyStatus === 'paid'}
                                    className={`w-full rounded-xl py-3.5 font-medium text-white transition ${
                                        policy.policyStatus === 'paid'
                                            ? 'bg-primary'
                                            : 'bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground'
                                    }`}
                                >
                                    {policy.policyStatus === 'paid'
                                        ? 'Оплачено'
                                        : isProcessing
                                        ? 'Обработка платежа...'
                                        : `Оплатить ${policy.premium} ${policy.currency}`}
                                </button>
                                {errors.general && (
                                    <p className="mt-2 text-sm text-destructive">{errors.general}</p>
                                )}

                            </form>
                        </div>
                    </div>

                    {/* Policy summary */}
                    <div>
                        <div className="sticky top-6 rounded-xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">

                            <h2 className="mb-6 text-lg font-semibold text-foreground sm:text-xl">
                                Детали полиса
                            </h2>

                            <div className="space-y-4">

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Номер полиса
                                    </p>

                                    <p className="mt-1 font-medium text-foreground">
                                        {policy.id}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Тип страхования
                                    </p>

                                    <p className="mt-1 font-medium text-foreground">
                                        {policy.insuranceType}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Период страхования
                                    </p>

                                    <p className="mt-1 font-medium text-foreground">
                                        {policy.startDate} — {policy.endDate}
                                    </p>
                                </div>

                                <div className="border-t border-border pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">
                                            К оплате
                                        </span>

                                        <span className="text-2xl font-bold tracking-tight text-foreground">
                                            {policy.premium} {policy.currency}
                                        </span>
                                    </div>
                                </div>

                            </div>

                            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    Статус полиса: <strong>Ожидает оплаты</strong>
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

