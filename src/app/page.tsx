import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FREE_PLAN_MONTHLY_LIMIT } from "@/lib/plan";

const FEATURES = [
  {
    title: "Receitas e despesas em um só lugar",
    description:
      "Lance vendas, serviços e custos em segundos e organize tudo por categoria.",
  },
  {
    title: "Painel com saldo em tempo real",
    description:
      "Veja quanto entrou, quanto saiu e o saldo do mês sem abrir uma planilha.",
  },
  {
    title: "Categorias personalizadas",
    description:
      "Crie categorias do seu jeito para entender exatamente de onde vem sua renda.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold">RendaFlow</span>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Entrar
            </Link>
            <Link href="/signup">
              <Button>Começar grátis</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Controle a renda do seu negócio sem planilha
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">
            RendaFlow ajuda autônomos e pequenos negócios a registrar
            receitas e despesas e enxergar para onde vai o dinheiro, em
            minutos.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/signup">
              <Button className="px-6 py-3 text-base">
                Criar conta grátis
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="px-6 py-3 text-base">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title}>
                <h3 className="font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section id="precos" className="mx-auto max-w-4xl px-6 pb-24">
          <h2 className="text-center text-2xl font-semibold text-slate-900">
            Planos simples, sem pegadinha
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <Card>
              <p className="text-sm font-medium text-slate-500">Gratuito</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                R$ 0
              </p>
              <ul className="mt-6 space-y-2 text-sm text-slate-600">
                <li>
                  Até {FREE_PLAN_MONTHLY_LIMIT} lançamentos por mês
                </li>
                <li>Categorias ilimitadas</li>
                <li>Painel com saldo e gráfico mensal</li>
              </ul>
              <Link href="/signup" className="mt-8 block">
                <Button variant="secondary" className="w-full">
                  Começar grátis
                </Button>
              </Link>
            </Card>
            <Card className="border-indigo-600">
              <p className="text-sm font-medium text-indigo-600">Pro</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                R$ 29<span className="text-base font-normal">/mês</span>
              </p>
              <ul className="mt-6 space-y-2 text-sm text-slate-600">
                <li>Lançamentos ilimitados</li>
                <li>Categorias ilimitadas</li>
                <li>Painel com saldo e gráfico mensal</li>
                <li>Suporte prioritário</li>
              </ul>
              <Link href="/signup" className="mt-8 block">
                <Button className="w-full">Assinar Pro</Button>
              </Link>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} RendaFlow.
      </footer>
    </div>
  );
}
