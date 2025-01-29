#! /usr/bin/env node

import { execSync } from "child_process";
import dotenv from "dotenv";
import fs from "fs";
import chalk from "chalk";
import cliProgress from "cli-progress";

// Carregar variáveis do .env
if (fs.existsSync(".env")) {
  dotenv.config();
} else {
  console.error(chalk.red("❌ Arquivo .env não encontrado."));
  process.exit(1);
}

const servidor = process.env.servidor;
const usuario = process.env.usuario;
const senha = process.env.senha;
const pasta = process.env.pasta;
const branch = process.env.branch || "master";

if (!servidor || !usuario || !senha || !pasta || !branch) {
  console.error(
    chalk.red("❌ As variáveis de ambiente não estão definidas corretamente.")
  );
  process.exit(1);
}

// Capturar mensagem do commit
const mensagem = process.argv.slice(2).join(" ");
if (!mensagem) {
  console.error(chalk.red("❌ Informe uma mensagem para o commit."));
  process.exit(1);
}

// Criar barra de progresso
const progressBar = new cliProgress.SingleBar(
  {
    format: "{bar} {percentage}%",
    barCompleteChar: "█",
    barIncompleteChar: "░",
    hideCursor: true,
    noTTYOutput: true,
    stream: process.stdout,
  },
  cliProgress.Presets.shades_classic
);

// Passos do deploy
const steps = [{ cmd: "git add .", status: "📂 Adicionando arquivos..." }];

// Verificar se há mudanças antes de commitar
const status = execSync("git status --porcelain").toString().trim();
if (status) {
  steps.push({
    cmd: `git commit -m "${mensagem}" > /dev/null 2>&1`,
    status: "📝 Realizando commit...",
  });
  steps.push({
    cmd: `git push origin ${branch} > /dev/null 2>&1`,
    status: "📤 Enviando alterações para o repositório...",
  });
} else {
  console.log(
    chalk.yellow("⚡ Nenhuma alteração para commit. Pulando essa etapa.")
  );
}

// Comando SSH corrigido para não mostrar a senha no terminal
const sshCommand = `sshpass -p '[SENHA_OCULTA]' ssh -o StrictHostKeyChecking=no -o PreferredAuthentications=password -o PubkeyAuthentication=no ${usuario}@${servidor} "cd ${pasta} && git pull origin ${branch} && exit 0"`;

steps.push({ cmd: sshCommand, status: "🌐 Conectando ao servidor..." });

console.clear(); // Limpa o terminal antes de iniciar
progressBar.start(steps.length, 0);

for (let i = 0; i < steps.length; i++) {
  try {
    // Atualiza a barra antes de cada comando
    progressBar.update(i + 1);
    console.log("\n" + chalk.cyan(steps[i].status)); // Mostra a ação atual

    // Se for o comando SSH, substitui [SENHA_OCULTA] pela senha real sem exibir no terminal
    if (steps[i].cmd.includes("[SENHA_OCULTA]")) {
      execSync(
        steps[i].cmd.replace(
          "[SENHA_OCULTA]",
          senha.replace(/(["'$`\\])/g, "\\$1")
        ),
        { stdio: "ignore" }
      );
    } else {
      execSync(steps[i].cmd, { stdio: "ignore" }); // Suprime a saída dos comandos
    }
  } catch (error) {
    progressBar.stop();

    // Captura erros do SSH e Git
    const errorMessage = error.message || "";
    if (errorMessage.includes("Permission denied")) {
      console.error(
        chalk.red("\n❌ Erro: Permissão negada ao conectar ao servidor.")
      );
      console.error(
        chalk.yellow(
          "🔒 Verifique se a senha está correta ou se o usuário tem permissão de acesso."
        )
      );
    } else if (errorMessage.includes("Connection refused")) {
      console.error(chalk.red("\n❌ Erro: Conexão recusada pelo servidor."));
      console.error(
        chalk.yellow(
          "🔒 O servidor pode estar bloqueando acessos. Tente mais tarde ou verifique regras de firewall."
        )
      );
    } else if (errorMessage.includes("Connection timed out")) {
      console.error(chalk.red("\n❌ Erro: O tempo limite de conexão expirou."));
      console.error(
        chalk.yellow(
          "🔒 O servidor pode estar temporariamente indisponível. Aguarde alguns minutos e tente novamente."
        )
      );
    } else if (errorMessage.includes("Too many authentication failures")) {
      console.error(
        chalk.red("\n❌ Erro: Muitas tentativas de login falhadas.")
      );
      console.error(
        chalk.yellow(
          "🔒 O servidor pode ter bloqueado temporariamente seu acesso. Aguarde alguns minutos antes de tentar novamente."
        )
      );
    } else {
      console.error(
        chalk.red(
          "\n❌ Erro ao conectar ao servidor. Verifique sua conexão e tente novamente."
        )
      );
    }

    process.exit(1);
  }
}

// Finaliza a barra e exibe a mensagem final
progressBar.stop();
console.clear();
console.log(chalk.green("🎉 Deploy concluído com sucesso! 🚀"));
