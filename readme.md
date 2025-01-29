## **📦 MandaPraProd**

> Porque eu cansei de digitar os mesmos comandos toda vez que faço um micro deploy.

### **💡 Sobre o projeto**

Toda vez que eu fazia um deploy em produção, eu precisava rodar os mesmos comandos manualmente:

- Adicionar os arquivos ao Git (`git add .`)
- Fazer commit (`git commit -m "mensagem"`)
- Enviar para o repositório (`git push`)
- Conectar no servidor via SSH (`ssh usuario@servidor`)
- Rodar um `git pull` no servidor para atualizar os arquivos  
  E isso **começou a me irritar profundamente**. Então eu resolvi automatizar esse processo de uma vez por todas! 🎉

Esse script foi feito **pensando em servidores da DreamHost**, onde o acesso SSH **é via senha**.  
Caso você queira usar **chave SSH** no lugar da senha, **é só remover o `sshpass` e fazer os ajustes** no comando de conexão.

---

## **⚡ Como instalar**

Você pode instalar o `mandapraprod` diretamente via NPM:

```sh
npm install -g mandapraprod
```

Isso tornará o comando `mpp` disponível globalmente no seu terminal.

Caso queira instalar manualmente:

1. Clone o repositório:
   ```sh
   git clone https://github.com/seu-usuario/mandapraprod.git
   ```
2. Entre na pasta:
   ```sh
   cd mandapraprod
   ```
3. Instale as dependências:
   ```sh
   npm install
   ```
4. Adicione o script globalmente:
   ```sh
   npm link
   ```

Agora o comando `mpp` estará disponível no terminal! 🎉

---

## **🔧 Configuração**

Crie um arquivo **`.env`** na pasta do projeto com as seguintes informações:

```ini
servidor=dominio.com
usuario=dh_151343
senha=SUA_SENHA_AQUI
pasta=public_html
branch=master
```

📌 **Explicação dos campos:**

- `servidor` → O endereço do servidor SSH
- `usuario` → Seu usuário SSH
- `senha` → Senha do SSH (⚠️ **NÃO compartilhe esse arquivo!**)
- `pasta` → Caminho onde está o repositório no servidor
- `branch` → Qual branch será puxada (`master`, `main`, etc.)

---

## **🚀 Como usar**

Depois de configurar o `.env`, basta rodar:

```sh
mpp "mensagem do commit"
```

O script irá:  
✅ Adicionar arquivos ao Git  
✅ Fazer commit com a mensagem  
✅ Fazer `git push` para o repositório  
✅ Conectar no servidor via SSH  
✅ Rodar `git pull` para atualizar os arquivos

E pronto! Deploy finalizado! 🚀

---

## **🛠 Alterando para usar Chave SSH ao invés de senha**

Se quiser usar **chave SSH**, basta:

1. **Remover a senha do `.env`**
2. **Alterar o comando SSH** no script para:
   ```sh
   ssh -o StrictHostKeyChecking=no ${usuario}@${servidor} "cd ${pasta} && git pull origin ${branch} && exit 0"
   ```
3. **Certificar-se de que sua chave está adicionada ao servidor**, rodando:
   ```sh
   ssh-copy-id usuario@servidor
   ```

---

## **🐛 Problemas comuns**

### **"Erro: Não foi possível conectar ao servidor."**

Se o servidor bloqueou seu acesso por muitas tentativas seguidas, **espere alguns minutos e tente novamente**.

### **"Permissão negada ao conectar ao servidor."**

Verifique se:

- O usuário e senha estão corretos
- Seu IP não está bloqueado pelo firewall
- O servidor permite autenticação por senha
