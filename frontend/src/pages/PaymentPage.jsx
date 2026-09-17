
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

        // Имитация обработки платежа
        setTimeout(() => {
            setIsProcessing(false);
            setIsPaid(true);
        }, 1500);
    };

    if (isLoadingPolicy) {
        return <p className="p-6 text-center text-gray-500">Загрузка данных полиса...</p>;
    }

    if (policyError || !policy) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500">{policyError ?? 'Полис не найден'}</p>
                <button type="button" onClick={() => navigate(-1)} className="mt-4 underline">
                    Назад
                </button>
            </div>
        );
    }

    if (isPaid) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-green-600"
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

                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                        Оплата прошла успешно
                    </h1>

                    <p className="text-gray-600 mb-6">
                        Полис {policy.id} успешно оплачен.
                    </p>

                    <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-500">Полис</span>
                            <span className="font-medium text-gray-900">
                                {policy.id}
                            </span>
                        </div>

                        <div className="flex justify-between mb-2">
                            <span className="text-gray-500">Страхование</span>
                            <span className="font-medium text-gray-900">
                                {policy.insuranceType}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-500">Сумма</span>
                            <span className="font-semibold text-gray-900">
                                {policy.premium} {policy.currency}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/my-policies')}
                        className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition"
                    >
                        Перейти к моим полисам
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-gray-500 hover:text-gray-900 mb-4"
                    >
                        ← Назад
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900">
                        Оплата страхового полиса
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Проверьте и введите данные банковской карты.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Payment form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Данные карты
                                    </h2>

                                </div>

                                <div className="text-sm font-medium text-gray-500">
                                    🔒 Secure
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>

                                {/* Card number */}
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                                ? 'border-red-500'
                                                : 'border-gray-300'
                                        } focus:outline-none focus:ring-2 focus:ring-gray-900`}
                                    />

                                    {errors.cardNumber && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.cardNumber}
                                        </p>
                                    )}
                                </div>

                                {/* Card holder */}
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                                ? 'border-red-500'
                                                : 'border-gray-300'
                                        } focus:outline-none focus:ring-2 focus:ring-gray-900`}
                                    />

                                    {errors.cardHolder && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.cardHolder}
                                        </p>
                                    )}
                                </div>

                                {/* Expiry + CVV */}
                                <div className="grid grid-cols-2 gap-4 mb-6">

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                                    ? 'border-red-500'
                                                    : 'border-gray-300'
                                            } focus:outline-none focus:ring-2 focus:ring-gray-900`}
                                        />

                                        {errors.expiryDate && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.expiryDate}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                                    ? 'border-red-500'
                                                    : 'border-gray-300'
                                            } focus:outline-none focus:ring-2 focus:ring-gray-900`}
                                        />

                                        {errors.cvv && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.cvv}
                                            </p>
                                        )}
                                    </div>

                                </div>

                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-medium hover:bg-gray-800 disabled:bg-gray-400 transition"
                                >
                                    {isProcessing
                                        ? 'Обработка платежа...'
                                        : `Оплатить ${policy.premium} ${policy.currency}`}
                                </button>

                            </form>
                        </div>
                    </div>

                    {/* Policy summary */}
                    <div>
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-6">

                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                Детали полиса
                            </h2>

                            <div className="space-y-4">

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Номер полиса
                                    </p>

                                    <p className="font-medium text-gray-900 mt-1">
                                        {policy.id}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Тип страхования
                                    </p>

                                    <p className="font-medium text-gray-900 mt-1">
                                        {policy.insuranceType}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Период страхования
                                    </p>

                                    <p className="font-medium text-gray-900 mt-1">
                                        {policy.startDate} — {policy.endDate}
                                    </p>
                                </div>

                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">
                                            К оплате
                                        </span>

                                        <span className="text-2xl font-bold text-gray-900">
                                            {policy.premium} {policy.currency}
                                        </span>
                                    </div>
                                </div>

                            </div>

                            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <p className="text-sm text-yellow-800">
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

