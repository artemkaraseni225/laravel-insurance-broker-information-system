import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

function formatPolicyDate(value) {
    if (!value) {
        return '—';
    }

    const date = new Date(`${value.slice(0, 10)}T00:00:00`);

    return Number.isNaN(date.getTime())
        ? '—'
        : new Intl.DateTimeFormat('ru-RU').format(date);
}

function formatDateTime(value) {
    if (!value) {
        return '—';
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? '—'
        : new Intl.DateTimeFormat('ru-RU').format(date);
}

export default function PolicyDetail() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function openPolicyPdf() {
        const pdfWindow = window.open('', '_blank');

        try {
            const response = await api.get(`/policies/${id}/pdf`, { responseType: 'blob' });
            const pdfUrl = URL.createObjectURL(response.data);

            if (pdfWindow) {
                pdfWindow.location.href = pdfUrl;
                window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000);
            } else {
                URL.revokeObjectURL(pdfUrl);
                setError('Разрешите открытие новых вкладок для просмотра PDF');
            }
        } catch {
            pdfWindow?.close();
            setError('Не удалось открыть PDF полиса');
        }
    }

    async function downloadPolicyPdf() {
        try {
            const response = await api.get(`/policies/${id}/pdf`, { responseType: 'blob' });
            const pdfUrl = URL.createObjectURL(response.data);
            const link = document.createElement('a');

            link.href = pdfUrl;
            link.download = `policy-${policy?.policyNumber ?? id}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(pdfUrl);
        } catch {
            setError('Не удалось скачать PDF полиса');
        }
    }

    async function openClientDocument() {
        const clientDocument = policy?.clientDocument;
        const documentWindow = window.open('', '_blank');

        if (!clientDocument) {
            documentWindow?.close();
            setError('Документ клиента отсутствует');
            return;
        }

        try {
            const response = await api.get(`/documents/${clientDocument.id}`, { responseType: 'blob' });
            const documentUrl = URL.createObjectURL(response.data);

            if (documentWindow) {
                documentWindow.location.href = documentUrl;
                window.setTimeout(() => URL.revokeObjectURL(documentUrl), 60_000);
            } else {
                URL.revokeObjectURL(documentUrl);
                setError('Разрешите открытие новых вкладок для просмотра документа');
            }
        } catch {
            documentWindow?.close();
            setError('Не удалось открыть документ клиента');
        }
    }

    useEffect(() => {
        api
            .get(`/policies/${id}`)
            .then(({ data }) => {
                const currentPolicy = data.policy;
                const insuranceData = currentPolicy.application?.insurance_data ?? {};
                const paidAt = currentPolicy.payment?.paid_at;
                const termMonths = Number(insuranceData.term_months);
                const fallbackStartDate = paidAt ? paidAt.slice(0, 10) : null;
                const fallbackEndDate = fallbackStartDate && termMonths > 0
                    ? (() => {
                        const endDate = new Date(`${fallbackStartDate}T00:00:00`);
                        endDate.setMonth(endDate.getMonth() + termMonths);
                        return endDate.toISOString().slice(0, 10);
                    })()
                    : null;

                const insuranceTypeCode =
                    currentPolicy.application?.insurance_type?.code ??
                    (() => {
                        const name = (currentPolicy.application?.insurance_type?.name ?? '').toLowerCase();
                        if (name.includes('авто') || name.includes('маш') || name.includes('транспорт')) return 'auto';
                        if (name.includes('недв') || name.includes('имуще') || name.includes('дом')) return 'property';
                        if (name.includes('здоров') || name.includes('health')) return 'health';
                        return 'unknown';
                    })();

                const insuredObject = (() => {
                    if (insuranceTypeCode === 'auto') {
                        return {
                            type: 'Транспортное средство',
                            icon: '🚗',
                            title: [insuranceData.car_brand, insuranceData.car_model].filter(Boolean).join(' ') || 'Автомобиль',
                            subtitle: insuranceData.license_plate || 'Гос. номер не указан',
                            fields: [
                                { label: 'Марка', value: insuranceData.car_brand || '—' },
                                { label: 'Модель', value: insuranceData.car_model || '—' },
                                { label: 'Гос. номер', value: insuranceData.license_plate || '—' },
                                { label: 'VIN / техпаспорт', value: insuranceData.vin_or_tech_passport || '—' },
                                { label: 'Объём двигателя', value: insuranceData.engine_volume ? `${insuranceData.engine_volume} см³` : '—' },
                                { label: 'Стаж вождения', value: insuranceData.driving_experience_years ? `${insuranceData.driving_experience_years} лет` : '—' },
                                { label: 'IDNP', value: insuranceData.idnp || '—' },
                            ],
                        };
                    }

                    if (insuranceTypeCode === 'property') {
                        const propertyTypeLabel =
                            insuranceData.property_type === 'apartment'
                                ? 'Квартира'
                                : insuranceData.property_type === 'house'
                                    ? 'Частный дом'
                                    : 'Недвижимость';

                        return {
                            type: 'Недвижимость',
                            icon: '🏠',
                            title: insuranceData.property_address || 'Недвижимость',
                            subtitle: propertyTypeLabel,
                            fields: [
                                { label: 'Адрес', value: insuranceData.property_address || '—' },
                                { label: 'Тип недвижимости', value: propertyTypeLabel },
                                { label: 'Площадь', value: insuranceData.area_sqm ? `${insuranceData.area_sqm} кв. м` : '—' },
                                { label: 'Есть риски', value: insuranceData.has_risk_factors === true ? 'Да' : insuranceData.has_risk_factors === false ? 'Нет' : '—' },
                                { label: 'IDNP', value: insuranceData.idnp || '—' },
                            ],
                        };
                    }

                    if (insuranceTypeCode === 'health') {
                        return {
                            type: 'Застрахованный',
                            icon: '👤',
                            title: 'Физическое лицо',
                            subtitle: insuranceData.date_of_birth ? formatPolicyDate(insuranceData.date_of_birth) : 'Дата рождения не указана',
                            fields: [
                                { label: 'Дата рождения', value: insuranceData.date_of_birth ? formatPolicyDate(insuranceData.date_of_birth) : '—' },
                                { label: 'IDNP', value: insuranceData.idnp || '—' },
                            ],
                        };
                    }

                    return {
                        type: 'Объект страхования',
                        icon: '📄',
                        title: 'Не указано',
                        subtitle: 'Детали отсутствуют',
                        fields: [],
                    };
                })();

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
                        registrationNumber: currentPolicy.application?.tariff?.company?.registration_number ?? '—',
                    },
                    clientDocument: currentPolicy.application?.documents?.find((document) => document.type === 'application/pdf')
                        ?? currentPolicy.application?.documents?.[0]
                        ?? null,
                    insuredObject,
                    financial: {
                        premium: currentPolicy.premium,
                        currency: 'MDL',
                        insuranceAmount: insuranceData.insurance_amount ?? '—',
                        paidAmount: currentPolicy.premium,
                    },
                    period: {
                        start: formatPolicyDate(currentPolicy.start_date ?? fallbackStartDate),
                        end: formatPolicyDate(currentPolicy.end_date ?? fallbackEndDate),
                    },
                    createdAt: formatDateTime(currentPolicy.application?.created_at),
                    issuedAt: formatDateTime(currentPolicy.application?.created_at),
                    broker: currentPolicy.application?.broker?.name ?? '—',
                    payment: {
                        status: currentPolicy.payment?.status ?? 'paid',
                        method: currentPolicy.payment?.method ?? '—',
                        date: formatDateTime(currentPolicy.payment?.paid_at),
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
                             className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            Печать
                        </button>
                        <button
                            type="button"
                            onClick={downloadPolicyPdf}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Скачать
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
                                        {policy.insuredObject.icon}
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            {policy.insuredObject.type}
                                        </p>

                                        <p className="font-semibold text-gray-900">
                                            {policy.insuredObject.title}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                    {policy.insuredObject.fields.length > 0 ? (
                                        policy.insuredObject.fields.map((field) => (
                                            <InfoField
                                                key={field.label}
                                                label={field.label}
                                                value={field.value}
                                            />
                                        ))
                                    ) : (
                                        <InfoField label="Описание" value={policy.insuredObject.subtitle} />
                                    )}
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
                                    onOpen={openPolicyPdf}
                                />

                                <DocumentRow
                                    name="Документ клиента"
                                    type="PDF"
                                    onOpen={openClientDocument}
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


function DocumentRow({ name, type, onOpen }) {
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
                type="button"
                onClick={onOpen}
                disabled={!onOpen}
                className="text-sm font-medium text-gray-700 hover:text-black"
            >
                Открыть
            </button>

        </div>
    );
}