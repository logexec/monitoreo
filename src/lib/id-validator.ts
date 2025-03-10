/*
 * Función para validar Cédula, RUC y Pasaporte ecuatorianos.
 */
const validarFormatoNumero = (numero: string): void => {
  if (!/^\d+$/.test(numero)) {
    throw new Error("No puede ingresar caracteres en el número");
  }
  if (numero.length < 10) {
    throw new Error("El número ingresado no es válido");
  }
};

const validarProvincia = (numero: string, numeroProvincias: number): void => {
  const provincia = parseInt(numero.slice(0, 2), 10);
  if (provincia < 1 || provincia > numeroProvincias) {
    throw new Error(
      "El código de la provincia (dos primeros dígitos) es inválido"
    );
  }
};

const calcularSuma = (
  numero: string,
  multiplicadores: number[],
  modulo: number
): number => {
  return multiplicadores.reduce((acc, multiplicador, i) => {
    let valor = parseInt(numero[i], 10) * multiplicador;
    if (modulo === 10 && valor >= 10) valor -= 9;
    return acc + valor;
  }, 0);
};

const validarTermino = (
  numero: string,
  termino: string,
  inicio: number
): void => {
  if (numero.slice(inicio, inicio + termino.length) !== termino) {
    throw new Error(`Este número debe terminar con ${termino}`);
  }
};

export const validarDocumento = (numero: string): boolean => {
  const numeroProvincias = 24;
  validarFormatoNumero(numero);
  validarProvincia(numero, numeroProvincias);

  const tercerDigito = parseInt(numero[2], 10);
  if (tercerDigito === 7 || tercerDigito === 8) {
    throw new Error("El tercer dígito ingresado es inválido.");
  }

  let suma = 0;
  let modulo = 11;
  let digitoVerificador = 0;

  const configuraciones: Record<
    string,
    {
      multiplicadores: number[];
      digitoVerificadorPos: number;
      termino?: string;
    }
  > = {
    cédula: {
      multiplicadores: [2, 1, 2, 1, 2, 1, 2, 1, 2],
      digitoVerificadorPos: 9,
      termino: "001", // Solo para RUC de personas naturales con más de 10 dígitos
    },
    rucPúblico: {
      multiplicadores: [3, 2, 7, 6, 5, 4, 3, 2, 0],
      digitoVerificadorPos: 8,
      termino: "0001",
    },
    rucPrivado: {
      multiplicadores: [4, 3, 2, 7, 6, 5, 4, 3, 2],
      digitoVerificadorPos: 9,
      termino: "001",
    },
  };

  let config;
  if (tercerDigito < 6) {
    modulo = 10;
    config = configuraciones["cédula"];
  } else if (tercerDigito === 6) {
    config = configuraciones["rucPúblico"];
  } else if (tercerDigito === 9) {
    config = configuraciones["rucPrivado"];
  }

  if (!config) {
    throw new Error("No se pudo determinar la configuración para este número.");
  }

  suma = calcularSuma(numero, config.multiplicadores, modulo);
  digitoVerificador = suma % modulo === 0 ? 0 : modulo - (suma % modulo);
  if (digitoVerificador !== parseInt(numero[config.digitoVerificadorPos], 10)) {
    throw new Error("El número ingresado es incorrecto.");
  }

  if (config.termino && numero.length > 10) {
    validarTermino(numero, config.termino, config.digitoVerificadorPos + 1);
  }

  return true;
};
