import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

export default function PolicyDetail() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api
            .get(`/policies/${id}`)
            .then(({ data }) => {
                const currentPolicy = data.policy;
                const insuranceData = currentPolicy.application?.insurance_data ?? {};

                setPolicy({
                    id: currentPolicy.id,
                    policyNumber: currentPolicy.policy_number,
                    status: currentPolicy.status,
                    insuranceType: currentPolicy.application?.insurance_type?.name ?? '—',
                    customer: {
                        fullName: currentPolicy.application?.customer?.name ?? '—',
                        email: currentPolicy.application?.customer?.email ?? '—',
                        phone: currentPolicy.application?.customer?.phone ?? '—',
                        address: currentPolicy.application?.customer?.address ?? '—',
                    },
                    insurer: {
                        name: currentPolicy.application?.tariff?.company?.name ?? '—',
                        registrationNumber: '—',
                    },
                    insuredObject: {
                        type: '—',
                        make: insuranceData.make ?? '—',
                        model: insuranceData.model ?? '—',
                        year: insuranceData.year ?? '—',
                        registrationNumber: insuranceData.registration_number ?? '—',
                        vin: insuranceData.vin ?? '—',
                    },
                    financial: {
                        premium: currentPolicy.premium,
                        currency: 'MDL',
                        insuranceAmount: insuranceData.insurance_amount ?? '—',
                        paidAmount: currentPolicy.premium,
                    },
                    period: {
                        start: currentPolicy.start_date ?? '—',
                        end: currentPolicy.end_date ?? '—',
                    },
                    createdAt: '—',
                    issuedAt: '—',
                    broker: '—',
                    payment: {
                        status: currentPolicy.payment?.status ?? 'paid',
                        method: currentPolicy.payment?.method ?? '—',
                        date: currentPolicy.payment?.paid_at ?? '—',
                        transactionId: currentPolicy.payment?.transaction_id ?? '—',
                    },
                });
            })
            .catch(() => setError('Не удалось загрузить полис'))
            .finally(() => setLoading(false));
    }, [id]);

    const statusConfig = {
        active: {
            label: "Действует",
            className: "bg-green-100 text-green-700",
        },
        paid: {
            label: "Оплачен",
            className: "bg-green-100 text-green-700",
        },
        expired: {
            label: "Истёк",
            className: "bg-red-100 text-red-700",
        },
        cancelled: {
            label: "Аннулирован",
            className: "bg-gray-100 text-gray-700",
        },
    };

    if (loading) {
        return <p className="p-6 text-center text-gray-500">Загрузка полиса...</p>;
    }

    if (error || !policy) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500">{error ?? 'Полис не найден'}</p>
                <button type="button" onClick={() => navigate('/my-policies')} className="mt-4 underline">
                    Назад к полисам
                </button>
            </div>
        );
    }

    const status = statusConfig[policy.status] ?? statusConfig.paid;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-6xl">

                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <button
                            onClick={() => navigate("/my-policies")}
                            className="mb-3 text-sm text-gray-500 hover:text-gray-800"
                        >
                            ← Назад к полисам
                        </button>

                        <h1 className="text-3xl font-bold text-gray-900">
                            Страховой полис
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Полис № {policy.policyNumber}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => window.print()}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Печать
                        </button>

                        <button
                            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            Скачать PDF
                        </button>
                    </div>
                </div>

                {/* Main policy card */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    {/* Policy header */}
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-5">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                            <div>
                                <p className="text-sm text-gray-500">
                                    Тип страхования
                                </p>

                                <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                    {policy.insuranceType}
                                </h2>
                            </div>

                            <span
                                className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-medium ${status.className}`}
                            >
                                ● {status.label}
                            </span>
                        </div>
                    </div>

                    <div className="p-6">

                        {/* Important information */}
                        <section className="mb-8">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Основная информация
                            </h3>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                                <InfoField
                                    label="Номер полиса"
                                    value={policy.policyNumber}
                                />

                                <InfoField
                                    label="Тип страхования"
                                    value={policy.insuranceType}
                                />

                                <InfoField
                                    label="Дата оформления"
                                    value={policy.issuedAt}
                                />

                                <InfoField
                                    label="Брокер"
                                    value={policy.broker}
                                />

                            </div>
                        </section>

                        {/* Period */}
                        <section className="mb-8">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Срок действия
                            </h3>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                                <InfoField
                                    label="Дата начала"
                                    value={policy.period.start}
                                />

                                <InfoField
                                    label="Дата окончания"
                                    value={policy.period.end}
                                />

                            </div>
                        </section>

                        {/* Customer */}
                        <section className="mb-8">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Страхователь
                            </h3>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                                <InfoField
                                    label="ФИО"
                                    value={policy.customer.fullName}
                                />

                                <InfoField
                                    label="Email"
                                    value={policy.customer.email}
                                />

                                <InfoField
                                    label="Телефон"
                                    value={policy.customer.phone}
                                />

                                <InfoField
                                    label="Адрес"
                                    value={policy.customer.address}
                                />

                            </div>
                        </section>

                        {/* Insurer */}
                        <section className="mb-8">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Страховщик
                            </h3>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                                <InfoField
                                    label="Страховая компания"
                                    value={policy.insurer.name}
                                />

                                <InfoField
                                    label="Регистрационный номер"
                                    value={policy.insurer.registrationNumber}
                                />

                            </div>
                        </section>

                        {/* Insured object */}
                        <section className="mb-8">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Застрахованный объект
                            </h3>

                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">

                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-xl shadow-sm">
                                        🚗
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Транспортное средство
                                        </p>

                                        <p className="font-semibold text-gray-900">
                                            {policy.insuredObject.make}{" "}
                                            {policy.insuredObject.model}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                                    <InfoField
                                        label="Марка"
                                        value={policy.insuredObject.make}
                                    />

                                    <InfoField
                                        label="Модель"
                                        value={policy.insuredObject.model}
                                    />

                                    <InfoField
                                        label="Год выпуска"
                                        value={policy.insuredObject.year}
                                    />

                                    <InfoField
                                        label="Гос. номер"
                                        value={policy.insuredObject.registrationNumber}
                                    />

                                    <InfoField
                                        label="VIN"
                                        value={policy.insuredObject.vin}
                                    />

                                </div>
                            </div>
                        </section>

                        {/* Financial */}
                        <section className="mb-8">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Финансовая информация
                            </h3>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

                                <MoneyField
                                    label="Страховая премия"
                                    value={policy.financial.premium}
                                    currency={policy.financial.currency}
                                />

                                <MoneyField
                                    label="Страховая сумма"
                                    value={policy.financial.insuranceAmount}
                                    currency={policy.financial.currency}
                                />

                                <MoneyField
                                    label="Оплачено"
                                    value={policy.financial.paidAmount}
                                    currency={policy.financial.currency}
                                />

                            </div>
                        </section>

                        {/* Payment */}
                        <section className="mb-8">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Информация об оплате
                            </h3>

                            <div className="rounded-lg border border-gray-200 p-5">

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                                    <InfoField
                                        label="Статус оплаты"
                                        value="Оплачено"
                                    />

                                    <InfoField
                                        label="Способ оплаты"
                                        value={policy.payment.method}
                                    />

                                    <InfoField
                                        label="Дата оплаты"
                                        value={policy.payment.date}
                                    />

                                    <InfoField
                                        label="ID транзакции"
                                        value={policy.payment.transactionId}
                                    />

                                </div>

                            </div>
                        </section>

                        {/* Documents */}
                        <section>
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Документы
                            </h3>

                            <div className="space-y-3">

                                <DocumentRow
                                    name="Страховой полис"
                                    type="PDF"
                                />

                                <DocumentRow
                                    name="Документ клиента"
                                    type="PDF"
                                />

                                <DocumentRow
                                    name="Подтверждение оплаты"
                                    type="PDF"
                                />

                            </div>
                        </section>

                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                        <div className="flex flex-col justify-between gap-2 text-sm text-gray-500 sm:flex-row">
                            <span>
                                Полис создан: {policy.createdAt}
                            </span>

                            <span>
                                ID полиса: #{policy.id}
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}


/*
|--------------------------------------------------------------------------
| Reusable components
|--------------------------------------------------------------------------
*/

function InfoField({ label, value }) {
    return (
        <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
            </p>

            <p className="wrap-break-word text-sm font-medium text-gray-900">
                {value || "—"}
            </p>
        </div>
    );
}


function MoneyField({ label, value, currency }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
                {label}
            </p>

            <p className="mt-2 text-xl font-bold text-gray-900">
                {Number(value).toLocaleString("ru-RU")} {currency}
            </p>
        </div>
    );
}


function DocumentRow({ name, type }) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">

            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    📄
                </div>

                <div>
                    <p className="text-sm font-medium text-gray-900">
                        {name}
                    </p>

                    <p className="text-xs text-gray-500">
                        {type} документ
                    </p>
                </div>
            </div>

            <button
                className="text-sm font-medium text-gray-700 hover:text-black"
            >
                Открыть
            </button>

        </div>
    );
}