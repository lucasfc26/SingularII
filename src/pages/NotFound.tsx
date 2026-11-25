import { BlackHole } from '@/components/loaders/BlackHoleLoader';
import { Button } from '@/components/ui/Button';
import { useDocumentTitle } from '@/hooks/dom';

export default function NotFound() {
  useDocumentTitle('Página não encontrada');
  return (
    <section className="shell flex min-h-[85vh] flex-col items-center justify-center pt-28 text-center">
      <BlackHole size={180} />
      <p className="eyebrow mt-10">Erro 404</p>
      <h1 className="mt-4 font-display text-4xl font-semibold md:text-6xl">Esta página cruzou o horizonte de eventos.</h1>
      <p className="mt-4 max-w-md text-muted">O endereço que você procurou não existe ou foi movido. Nenhuma informação se perde para sempre — mas esta, por enquanto, não conseguimos recuperar.</p>
      <div className="mt-8 flex gap-3">
        <Button to="/">Voltar ao início</Button>
        <Button to="/explorar" variant="secondary">Explorar temas</Button>
      </div>
    </section>
  );
}
