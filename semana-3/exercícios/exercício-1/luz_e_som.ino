/*
 * Definindo as portas das saídas do sistema (atuadores).
 */
#define OUTPUT_BUZZER 2
#define OUTPUT_LED_1 47
#define OUTPUT_LED_2 48
#define OUTPUT_LED_3 36
#define OUTPUT_LED_4 40

/*
 * Definindo as portas das entradas do sistema (sensores).
 */
#define INPUT_LDR 4
#define INPUT_BOTAO_1 1
#define INPUT_BOTAO_2 6

// Criando uma variável global para o controle da quantidade de leituras realizadas pelo usuário.
int leituras_realizadas = 0;

// Criando um vetor para armazenar as leituras realizadas pelo usuário no formato decimal (números esses normalizados entre 1 a 15 do sensor LDR com intervalo entre 0 e 4095).
int decimais_cadastrados[4] = {0,0,0,0};

/*
 * Normaliza um número de um intervalo [0,4095] para [1,15].
 * @param int entrada - número alvo da normalização.
 * @return int - número normalizado entre [1,15].
 */
int normalizar_entre_0_a_15(int entrada)
{

  // Definindo o valor máximo de leitura digital do sensor LDR.
  int leitura_max_ldr = 4095;

  // Definindo o valor mínimo de leitura digital do sensor LDR.
  int leitura_min_ldr = 524;

  // Instanciando um espaço na memória para armazenar o número normalizado.
  int numero_normalizado_entre_1_a_15 = 0;

  // Instanciando o valor atual como sendo o valor máximo da leitura de leitura digital do sensor LDR.
  int valor_atual = leitura_max_ldr;

  // Realizando um loop para calcular o número normalizado.
  while(valor_atual >= entrada) {

    numero_normalizado_entre_1_a_15++;
    valor_atual -= 273;

	// Valor mínimo que o sensor LDR lê.
	if(valor_atual <= leitura_min_ldr) {
		numero_normalizado_entre_1_a_15 = 16;
		break;
	}

  }
  
  // Retornando o número normalizado entre 1 a 15.
  return 16 - numero_normalizado_entre_1_a_15;
  
}

/*
 * Converte um número decimal para um número binário através da manipulação um vetor de quatro posições.
 * @param int n - número decimal alvo da conversão.
 * @param int numero_binario_inverso[4] - vetor que armazenará o decimal convertido em binário de maneira inversa.
 */
void decimal_para_binario(int n, int numero_binario_inverso[4])
{

	for(int i = 0; i < 4; i++) {

		numero_binario_inverso[i] = 0;

	}
 
  int i = 0;

  while (n > 0) {
  
      numero_binario_inverso[i] = n % 2;
      n = n / 2;
      i++;

  }

}

/*
 * Acende LEDs se baseando em um vetor que representa um número binário de quatro posições.
 * @param int numero_binario_inverso[4] - vetor que armazena um número binário de maneira inversa.
 */
void acender_leds(int numero_binario_inverso[4]) 
{

  // Recebendo todos os outputs de LED no sentido físico da direita para a esqueda.
  int output[4] = {OUTPUT_LED_4, OUTPUT_LED_3, OUTPUT_LED_2, OUTPUT_LED_1};

  // Serial.println("Número binário:");
  // Serial.printf("%i", numero_binario_inverso[0]);
  // Serial.printf("%i", numero_binario_inverso[1]);
  // Serial.printf("%i", numero_binario_inverso[2]);
  // Serial.printf("%i", numero_binario_inverso[3]);
  // Serial.println("");

  // Manipulando as quatro saídas de luz.
  for(int i = 0; i < 4; i++) {

    // Acendendo ou apagando um LED com base no número binário passado.
    switch(numero_binario_inverso[i]) {

      case 1:
        digitalWrite(output[i], HIGH);
      break;

      case 0:
        digitalWrite(output[i], LOW);

    }

  }

}

/*
 * Devolve uma frequência de som com base em um número decimal.
 * @param int decimal_normalizado - um número decimal entre o intervalo [1,15]
 * @return int - frequência de som calculada.
 */
int hertz_do_numero(int decimal_normalizado)
{

  return decimal_normalizado*200;

}

/*
 * Toca um "bip" três vezes seguidas, simbolizando a tomada de uma ação não permitida.
 */
void tocar_som_de_acao_nao_permitida() 
{

  for(int i = 0; i < 3; i++) {

    tone(OUTPUT_BUZZER, 3000);
    delay(500);
    noTone(OUTPUT_BUZZER);
    delay(100);

  }

}

/*
 * Configurando o sistema como um todo: suas entradas (sensores) e saídas (atuadores).
 */
void setup() 
{

  // Definindo a frequência da porta serial.
  Serial.begin(9600);

  // Configurando os modos dos pins de saídas (atuadores) do sistema.
  pinMode(OUTPUT_BUZZER, OUTPUT);
  pinMode(OUTPUT_LED_4, OUTPUT);
  pinMode(OUTPUT_LED_3, OUTPUT);
  pinMode(OUTPUT_LED_2, OUTPUT);
  pinMode(OUTPUT_LED_1, OUTPUT);

  // Configurando os modos dos pins de entradas (sensores) do sistema.
  pinMode(INPUT_LDR, INPUT);
  pinMode(INPUT_BOTAO_1, INPUT);
  pinMode(INPUT_BOTAO_2, INPUT);


}

void loop() 
{

  // Realizando a leitura analógica do sensor LDR.
  int leitura = analogRead(INPUT_LDR);

  Serial.println("Leitura realizada:");
  Serial.println(leitura);


  // Normalizando o valor recebido no intervalo de [0, 4095] para [1,15].
  int valor_normalizado = normalizar_entre_0_a_15(leitura);

  // Serial.println("");
  // Serial.printf("Valor normalizado:");
  // Serial.printf("%i", valor_normalizado);
  // Serial.println("");

  // Instancinado um vetor para armazenar um número binário com quatro dígitos.
  int numero_binario_inverso[4];

  // Transformando o decimal em um número binário, e armazenando-o no vetor criado acima.
  decimal_para_binario(valor_normalizado, numero_binario_inverso);

  // Acendendo os LEDs como forma de feedback para o usuário, da luminosidade normalizada nesse instante.
  acender_leds(numero_binario_inverso);

  // Armazenando o status atual do botão 1.
  int botao_1_esta_pressionado = digitalRead(INPUT_BOTAO_1);

  // Se o botão 1 está pressionado...
  if(botao_1_esta_pressionado) {

    // Se as leituras realizadas forem menor que 4, permitindo mais uma gravação.
    if(leituras_realizadas < 4) {

      decimais_cadastrados[leituras_realizadas] = valor_normalizado;

      leituras_realizadas++;
      acender_leds(numero_binario_inverso);
      tone(OUTPUT_BUZZER, hertz_do_numero(valor_normalizado));

      delay(1000);
      noTone(OUTPUT_BUZZER);

    // Se não, tocando um som de ação não permitida, uma vez que já o usuário já realizou o máximo de leituras permitidas.
    } else {

      tocar_som_de_acao_nao_permitida();

    }

  }

  // Armazenando o status atual do botão 2.
  int botao_2_esta_pressionado = digitalRead(INPUT_BOTAO_2);

  // Se o botão 2 está pressionado...
  if(botao_2_esta_pressionado) {

    // Se a quantidade de leituras realizadas for diferente da quantidade máxima que deve ser armazenada, tocando um som de ação não permitida.
    if(leituras_realizadas != 4) {

      tocar_som_de_acao_nao_permitida();

    // Se não, tocando a "música" composta pelo usuário através das leituras que ele mesmo realizou.
    } else {

      for(int i = 0; i < 4; i++) {

        // Instanciando um vetor para armazenar um número binário com quatro dígitos.
        int numero_binario_inverso[4];

        // Convertendo o número decimal cadastrado atual em um número binário invertido.
        decimal_para_binario(decimais_cadastrados[i], numero_binario_inverso);

        // Acendendo os LEDs correspondentes.
        acender_leds(numero_binario_inverso);

        // Tocando o som com a frequência característica do dígito armazenado.
        tone(OUTPUT_BUZZER, hertz_do_numero(decimais_cadastrados[i]));
        delay(500);
        noTone(OUTPUT_BUZZER);

      }

    }

  }

}