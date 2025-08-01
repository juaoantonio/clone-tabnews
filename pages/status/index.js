import useSWR from "swr";
import Image from "next/image";

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

async function fetchAPI(key) {
  const response = await fetch(key, {});
  return await response.json();
}

export default function StatusPage() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 1000,
    dedupingInterval: 1000,
  });
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
            Status da Aplicação
            <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Online
            </span>
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Última atualização: {formatDate(data.updated_at)}
          </p>
        </div>

        <div className="px-6 py-4 space-y-8">
          <div className="group">
            <h2 className="text-lg font-medium text-gray-700 capitalize">
              Banco de Dados{" "}
              <Image
                src={"https://www.svgrepo.com/show/303301/postgresql-logo.svg"}
                alt={"Logo PostgreSQL"}
                width={24}
                height={24}
                className="inline-block ml-1"
              />
            </h2>

            <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Versão</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {data.dependencies.database.version}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Conexões Abertas
                </dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {data.dependencies.database.opened_connections}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Máximo de Conexões
                </dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {data.dependencies.database.max_connections}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
