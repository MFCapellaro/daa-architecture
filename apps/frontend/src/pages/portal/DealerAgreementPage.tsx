import React, { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import agreementUrl from '../../../../acuerdo/AcuerdoDealer.txt?url';
import '../pools.css';

const AGREEMENT_VERSION = '1.1';

interface DealerAgreement {
  acceptedAt: string;
  version: string;
  acceptanceId: string;
  legalName: string;
  taxId: string;
  representative: string;
}

interface DealerProfile {
  name: string;
  profile: { organization?: string };
  dealerAgreement: DealerAgreement | null;
}

export const DealerAgreementPage: React.FC = () => {
  const { token } = useAuth();
  const [agreementText, setAgreementText] = useState('');
  const [dealer, setDealer] = useState<DealerProfile | null>(null);
  const [legalName, setLegalName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [representative, setRepresentative] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadAgreement = async () => {
      try {
        const [profileResponse, agreementResponse] = await Promise.all([
          fetch('/api/participants/me', { headers: { Authorization: `Bearer ${token}` } }),
          fetch(agreementUrl),
        ]);
        const result = await profileResponse.json() as DealerProfile & { message?: string };
        if (!profileResponse.ok) throw new Error(result.message || `No se pudo consultar el acuerdo (${profileResponse.status}).`);
        if (!agreementResponse.ok) throw new Error(`No se pudo cargar el texto del acuerdo (${agreementResponse.status}).`);
        const bytes = new Uint8Array(await agreementResponse.arrayBuffer());
        let text: string;
        try {
          text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        } catch {
          text = new TextDecoder('windows-1252').decode(bytes);
        }
        if (active) {
          setAgreementText(text);
          setDealer(result);
          setLegalName(result.dealerAgreement?.legalName || result.profile?.organization || result.name);
          setTaxId(result.dealerAgreement?.taxId ?? '');
          setRepresentative(result.dealerAgreement?.representative ?? '');
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'No se pudo cargar el acuerdo Dealer.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadAgreement();
    return () => { active = false; };
  }, [token]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/participants/me/dealer-agreement', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accepted,
          version: AGREEMENT_VERSION,
          legalName,
          taxId,
          representative,
        }),
      });
      const result = await response.json() as { dealerAgreement?: DealerAgreement; message?: string };
      if (!response.ok || !result.dealerAgreement) {
        throw new Error(result.message || `No se pudo registrar la aceptación (${response.status}).`);
      }
      const acceptance = result.dealerAgreement;
      setDealer((current) => current ? { ...current, dealerAgreement: acceptance } : current);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo registrar la aceptación del acuerdo.');
    } finally {
      setSaving(false);
    }
  };

  const currentAcceptance = dealer?.dealerAgreement?.version === AGREEMENT_VERSION ? dealer.dealerAgreement : null;

  return (
    <main className="pools-page">
      <div className="pools-page__inner">
        <header className="pools-page__header">
          <div>
            <h1>Acuerdo de Integración del Dealer</h1>
            <p>La aceptación expresa de la versión vigente habilita la gestión y publicación de Pools.</p>
          </div>
          <Link className="pool-button pool-button--secondary" to="/portal/pools">Mis pools</Link>
        </header>
        {error && <p role="alert" className="pool-message pool-message--error">{error}</p>}
        {loading ? <p className="pool-empty">Cargando acuerdo…</p> : (
          <>
            <section className="pool-panel" aria-label="Texto completo del acuerdo">
              <div className="dealer-agreement__document">
                <pre>{agreementText}</pre>
              </div>
            </section>
            {currentAcceptance ? (
              <section className="pool-message pool-message--success" aria-live="polite">
                Acuerdo aceptado. Versión {currentAcceptance.version}; fecha y hora:{' '}
                {new Intl.DateTimeFormat('es-AR', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(currentAcceptance.acceptedAt))}.
                <br />Identificador de aceptación: {currentAcceptance.acceptanceId}
              </section>
            ) : (
              <form className="pool-panel pool-form" onSubmit={(event) => void submit(event)}>
                <h2>Datos del acuerdo aceptado · Versión {AGREEMENT_VERSION}</h2>
                <p className="pool-card__description">
                  La aceptación quedará asociada a tu cuenta Dealer, con fecha, hora e identificador electrónico.
                </p>
                <div className="pool-form__grid">
                  <label className="pool-form__field">Razón social o nombre comercial
                    <input className="pool-form__input" required maxLength={160} value={legalName}
                      onChange={(event) => setLegalName(event.target.value)} />
                  </label>
                  <label className="pool-form__field">CUIT
                    <input className="pool-form__input" required inputMode="numeric" pattern="[0-9]{2}-?[0-9]{8}-?[0-9]"
                      placeholder="30-12345678-9" value={taxId} onChange={(event) => setTaxId(event.target.value)} />
                  </label>
                  <label className="pool-form__field pool-form__field--wide">Representante autorizado (si corresponde)
                    <input className="pool-form__input" maxLength={160} value={representative}
                      onChange={(event) => setRepresentative(event.target.value)} />
                  </label>
                </div>
                <label className="dealer-agreement__accept">
                  <input type="checkbox" required checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
                  Leí y acepto expresamente el Acuerdo de Integración del Dealer, versión {AGREEMENT_VERSION}.
                </label>
                <button className="pool-button pool-button--primary" type="submit" disabled={saving || !accepted}>
                  {saving ? 'Registrando aceptación…' : 'Aceptar acuerdo y habilitar Pools'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </main>
  );
};
