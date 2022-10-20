// Importando as bibliotecas necessárias.
#include <iostream>
#include <cstring>

// Definindo o espaço de nomes.
using namespace std;

/**
 * Devolve o valor percentual de um número alvo de acordo com um intervalo mínimo e máximo.
 * @param int alvo define o número alvo.
 * @param int min define o valor mínimo do intervalo.
 * @param int max define o valor máximo do intervalo.
 * @return int percentual valor ajustados percentualmente ao intervalo especificado.
 */
int converteSensor(int alvo, int min, int max)
{

	// Calculando o intervalo total.
	int total = max - min;

	// Sobrescrevendo o valor alvo com o seu valor relativo.
	alvo = alvo - min;

	// Calculando o valor percentual desejado.
	float percentual = float(alvo) / total;

	// Retornando o valor percentual calculado num intervalo de 0 a 100.
	return percentual * 100;
}

/**
 * Realiza a leitura de um valor a partir do teclado do usuário no intervalo específicado.
 * @return int num número capturado dentro do intervalo especificado.
 */
int leituraSensor()
{

	// Definindo o número inicial como -1 para instanciar a variável e limpar o buffer.
	int num = -1;

	// Definindo uma variável de controle para o caso da entrada de números fora do intervalo especificado.
	bool numero_fora_do_intervalo = false;

	// Solicitando o número até que ele esteja dentro do intervalo especificado.
	do
	{

		if (numero_fora_do_intervalo)
		{

			cout << "Número fora do intervalo!" << endl;
		}

		cout << "Digite um número inteiro entre o intervalo 0 a 830: ";
		cin >> num;

		numero_fora_do_intervalo = true;

	} while (num < 0 || num > 830);

	// Retornando o número capturado.
	return num;
}

/**
 * Armazena uma medida numa certa posição do vetor.
 * @param int* vetor ponteiro para o vetor aonde se deseja armazenar a medida.
 * @param int tamanho_do_vetor tamanho do vetor passado no parâmetro anterior.
 * @param int posicao_para_armazenamento posição para armazenar a medida desejada.
 * @param int medida_a_ser_armazenada medida a ser armazenada no vetor passado no primeiro parâmetro dessa função.
 * @return int posicao_para_armazenamento+1 próxima posição para armazenamento.
 */
int armazenaVetor(int *vetor, int tamanho_do_vetor, int posicao_para_armazenamento, int medida_a_ser_armazenada)
{

	// Verificando se a posição para armazenamento não é maior que o tamanho do vetor.
	if (posicao_para_armazenamento < tamanho_do_vetor)
	{

		// Armazenando a medida na posição indicada.
		vetor[posicao_para_armazenamento] = medida_a_ser_armazenada;

		// Retornando a próxima posição para armazenamento.
		return posicao_para_armazenamento + 1;
	}
}

/**
 * Retorna o sentido de maior distância.
 * @param int* vetor vetor com as distâncias capturadas.
 * @param int* var ponteiro para uma variável que armaze o valor da maior distância.
 * @return static char dir sentido de maior distância.
 */
char *direcaoMenorCaminho(int *vetor, int *var)
{

	// Instanciando uma variável para armazenar o sentido de maior distância.
	static char dir;

	// Inicializando uma variável com o maior valor igual a -1 para limpar o buffer.
	int maior_valor = -1;

	// Capturando o sentido de maior distância e essa distância.
	if (vetor[0] > maior_valor)
	{

		dir = 'D';
		maior_valor = vetor[0];
	}

	if (vetor[1] > maior_valor)
	{

		dir = 'E';
		maior_valor = vetor[1];
	}

	if (vetor[2] > maior_valor)
	{

		dir = 'F';
		maior_valor = vetor[2];
	}

	if (vetor[3] > maior_valor)
	{

		dir = 'T';
		maior_valor = vetor[3];
	}

	// Definindo o valor da variável recebida por parâmetro como sendo o maior valor encontrado.
	*var = maior_valor;

	// Returnando o endereço da variável que armazena o sentido de maior distância.
	return &dir;
}

/**
 * Pergunta ao usuário se ele quer ou não continuar o mapeamento.
 * @return int 0 1 número 0 para NAO e 1 para SIM.
 */
int leComando()
{

	// Criando um vetor de caracteres para armazenar a entrada que será capturada do usuário.
	char opcao_escolhida[3];

	// Capturando a entrada do usuário.
	do
	{

		cout << "Você deseja continuar o mapeamento? Digite SIM ou NÃO (outros valores não serão aceitos): ";
		cin >> opcao_escolhida;

	} while (!(strcmp(opcao_escolhida, "SIM") == 0 || strcmp(opcao_escolhida, "NAO") == 0));

	// Retornando 1 ou 0 com base na opção digitada pelo usuário.
	if (strncmp(opcao_escolhida, "SIM", 3) == 0)
	{

		return 1;
	}
	else
	{

		return 0;
	}
}

/**
 * Verifica as distâncias e mapeia o terreno para movimentações futuras.
 * @param int*v vetor de inteiros.
 * @param int maxv tamanho máximo do vetor.
 * @return int posAtualVetor posição atual do vetor.
 */
int dirige(int *v, int maxv)
{

	int maxVetor = maxv;
	int *vetorMov = v;
	int posAtualVetor = 0;
	int dirigindo = 1;

	while (dirigindo)
	{

		int medida = leituraSensor();
		medida = converteSensor(medida, 0, 830);
		posAtualVetor = armazenaVetor(vetorMov, maxVetor, posAtualVetor, medida);

		medida = leituraSensor();
		medida = converteSensor(medida, 0, 830);
		posAtualVetor = armazenaVetor(vetorMov, maxVetor, posAtualVetor, medida);

		medida = leituraSensor();
		medida = converteSensor(medida, 0, 830);
		posAtualVetor = armazenaVetor(vetorMov, maxVetor, posAtualVetor, medida);

		medida = leituraSensor();
		medida = converteSensor(medida, 0, 830);
		posAtualVetor = armazenaVetor(vetorMov, maxVetor, posAtualVetor, medida);

		dirigindo = leComando();
	}

	return posAtualVetor;
}

/**
 * Lê os sensores e o movimento do robô. No final, percorre o vetor e mostra o movimento a cada direção baseado na maior distância a cada movimento.
 */
void percorre(int *v, int tamPercorrido)
{

	int *vetorMov = v;
	int maiorDir = 0;

	for (int i = 0; i < tamPercorrido; i += 4)
	{
		char *direcao = direcaoMenorCaminho(&(vetorMov[i]), &maiorDir);
		printf("Movimentando para %s distancia = %i\n", direcao, maiorDir);
	}
}

/**
 * Função principal da aplicação.
 */
int main(int argc, char **argv)
{

	// Definindo o tamanho máximo do vetor como 100 posiç?es.
	int maxVetor = 100;

	// Reservando o tamanho para armazenar 100 números inteiros.
	int vetorMov[maxVetor * 4];

	// Definindo a posiç?o atual do vetor como sendo zero.
	int posAtualVet = 0;

	// Manipulando a posiç?o atual através da funç?o 'dirige'.
	posAtualVet = dirige(vetorMov, maxVetor);

	// Percorrendo o vetor móvel.
	percorre(vetorMov, posAtualVet);

	// Retornando 0 para informar a execução com sucesso do programa.
	return 0;
}