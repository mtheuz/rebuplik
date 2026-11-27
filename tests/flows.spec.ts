import { test, expect, type Page } from '@playwright/test';
import { rentalQuote } from '../src/data';

async function verify(page: Page) {
  await page.getByRole('button', { name: 'Continuar com e-mail acadêmico' }).click();
  await page.getByLabel('Código de verificação').fill('123456');
  await page.getByRole('button', { name: 'Confirmar meu vínculo' }).click();
  await page.getByRole('button', { name: 'Continuar para a comunidade' }).click();
}

test('explorar, filtrar, favoritar e persistir', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Encontre seu lugar');
  await expect(page.locator('.listing-card')).toHaveCount(8);
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Ver mais vagas' }).click();
  await expect(page.locator('.listing-card')).toHaveCount(9);
  await page.getByRole('combobox', { name: 'Universidade', exact: true }).selectOption('USP');
  await page.getByRole('combobox', { name: 'Orçamento máximo' }).selectOption('800');
  await page.getByRole('button', { name: 'Buscar vagas' }).click();
  await expect(page.locator('.listing-card')).toHaveCount(3);
  await page.locator('.listing-card').first().getByRole('button', { name: 'Salvar nos favoritos' }).click();
  await page.goto('/meu-espaco?aba=salvos');
  await expect(page.locator('.listing-card')).toHaveCount(3);
  await page.reload();
  await expect(page.locator('.listing-card')).toHaveCount(3);
  await page.goto('/?q=naoexiste123');
  await expect(page.getByRole('heading', { name: 'Ainda não encontramos esse match' })).toBeVisible();
  await page.getByRole('button', { name: 'Ver todos os anúncios' }).click();
  await expect(page.locator('.listing-card')).toHaveCount(8);
  expect(errors).toEqual([]);
});

test('verificação, chat, visita e proposta', async ({ page }) => {
  await page.goto('/anuncio/moradia-1');
  await page.getByRole('button', { name: 'Agendar uma visita' }).click();
  await expect(page).toHaveURL(/verificar/);
  await page.getByRole('button', { name: 'Continuar com e-mail acadêmico' }).click();
  await page.getByLabel('Código de verificação').fill('111111');
  await page.getByRole('button', { name: 'Confirmar meu vínculo' }).click();
  await expect(page.getByRole('alert')).toContainText('não confere');
  await page.getByLabel('Código de verificação').fill('123456');
  await page.getByRole('button', { name: 'Confirmar meu vínculo' }).click();
  await page.getByRole('button', { name: 'Continuar para a comunidade' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Dia da visita').fill('2026-12-15');
  await page.getByRole('button', { name: 'Solicitar visita no chat' }).click();
  await expect(page.locator('.message-bubble.mine')).toContainText('15/12/2026');
  await expect(page.locator('.message-bubble').last()).toContainText('Recebi sua sugestão');
  await page.getByLabel('Sua mensagem').fill('Podemos conversar às 15h?');
  await page.getByRole('button', { name: 'Enviar mensagem' }).click();
  await expect(page.locator('.message-bubble').last()).toContainText('Qual período');
  await page.reload();
  await expect(page.locator('.message-bubble.mine').last()).toContainText('Podemos conversar');
  await page.goto('/anuncio/item-1');
  await page.getByRole('button', { name: 'Fazer uma proposta' }).click();
  await page.getByLabel('Sua oferta (R$)').fill('280');
  await page.getByRole('button', { name: 'Enviar proposta no chat' }).click();
  await expect(page.locator('.message-bubble.mine')).toContainText('280');
  await expect(page.locator('.message-bubble').last()).toContainText('Recebi sua proposta');
});

test('criar, publicar, editar e alterar disponibilidade', async ({ page }) => {
  await page.goto('/anunciar');
  await page.getByRole('button', { name: 'Quero desapegar de um item' }).click();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByLabel('Título do anúncio').fill('Mesa de estudos do hackathon');
  await page.getByLabel('Preço do item (R$)').fill('150');
  await page.getByLabel('Conte sobre o item').fill('Mesa em ótimo estado, muito boa para estudar e trabalhar, com estrutura firme e espaço para um notebook.');
  await page.getByRole('button', { name: 'Usar foto demonstrativa 1' }).click();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByLabel('Bairro', { exact: true }).fill('Butantã');
  await page.getByLabel('Distância aproximada').fill('500');
  await page.getByRole('button', { name: 'Revisar meu anúncio' }).click();
  await page.getByRole('button', { name: 'Verificar vínculo e continuar' }).click();
  await verify(page);
  await expect(page.getByRole('heading', { name: 'Tudo pronto para uma nova história?' })).toBeVisible();
  await page.getByRole('button', { name: 'Publicar anúncio' }).click();
  await expect(page.getByRole('heading', { name: 'Seu anúncio ganhou vida!' })).toBeVisible();
  await page.getByRole('link', { name: 'Ver meu anúncio', exact: true }).click();
  const url = page.url();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mesa de estudos do hackathon');
  await page.getByRole('link', { name: 'Editar meu anúncio' }).click();
  await page.getByLabel('Preço do item (R$)').fill('175');
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByRole('button', { name: 'Revisar meu anúncio' }).click();
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await page.goto('/meu-espaco');
  const own = page.locator('.my-listing').filter({ hasText: 'Mesa de estudos do hackathon' });
  await expect(own).toContainText('175');
  await own.getByRole('combobox').selectOption('Reservado');
  await page.goto('/desapego?q=Mesa+de+estudos+do+hackathon');
  await expect(page.locator('.listing-card')).toHaveCount(0);
  await page.goto(url);
  await expect(page.locator('.status-pill')).toHaveText('Reservado');
});

test('layout mobile, navegação e imagens locais', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/', '/desapego', '/anuncio/moradia-1', '/anuncio/item-1', '/meu-espaco', '/verificar', '/anunciar', '/mensagens?anuncio=moradia-1']) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow em ${route}`).toBe(true);
    await expect(page.getByRole('navigation', { name: 'Navegação mobile' })).toBeVisible();
    const broken = await page.locator('img').evaluateAll(async imgs => { await Promise.all(imgs.map(i => { i.loading = 'eager'; return i.decode().catch(() => undefined); })); return imgs.filter(i => i.complete && i.naturalWidth === 0).map(i => i.src); });
    expect(broken).toEqual([]);
    if (route === '/') await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
    if (route === '/anuncio/moradia-1') await page.screenshot({ path: 'test-results/detail-mobile.png', fullPage: true });
  }
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Navegação mobile' }).getByRole('link', { name: 'Desapego' }).click();
  await expect(page).toHaveURL('/desapego');
  await page.getByRole('button', { name: 'Filtros', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Aplicar filtros' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('rascunho de edição preserva fotos e valores durante a verificação', async ({ page }) => {
  await page.goto('/anunciar/meu-1');
  await page.getByLabel('Título do anúncio').fill('Quarto atualizado para o hackathon');
  await page.getByLabel('Aluguel mensal (R$)').fill('900');
  await page.locator('input[type=file]').setInputFiles('public/images/room-5.jpg');
  await expect(page.locator('.upload-previews>div')).toHaveCount(3);
  await page.reload();
  await expect(page.getByLabel('Título do anúncio')).toHaveValue('Quarto atualizado para o hackathon');
  await expect(page.locator('.upload-previews>div')).toHaveCount(3);
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByRole('button', { name: 'Revisar meu anúncio' }).click();
  await page.getByRole('button', { name: 'Verificar vínculo e continuar' }).click();
  await verify(page);
  await expect(page.getByRole('heading', { name: 'Tudo pronto para uma nova história?' })).toBeVisible();
  await expect(page.locator('.review-info')).toContainText('Quarto atualizado para o hackathon');
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await page.getByRole('link', { name: 'Ver meu anúncio', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Quarto atualizado para o hackathon');
  await expect(page.locator('.contact-price')).toContainText('1.050');
  await page.getByRole('button', { name: 'Reiniciar demo', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reiniciar demo', exact: true }).click();
  await page.goto('/anuncio/meu-1');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Quarto com varanda — Apê no Butantã');
});

test('aluguel de itens: filtrar, calcular e solicitar pelo chat', async ({ page }) => {
  await page.goto('/desapego');
  await page.getByRole('button', { name: 'Para alugar', exact: true }).click();
  await expect(page.locator('.listing-card')).toHaveCount(3);
  await page.getByLabel('Período de cobrança', { exact: true }).selectOption('week');
  await expect(page.locator('.listing-card')).toHaveCount(1);
  await expect(page.locator('.card-price')).toContainText('/semana');
  await page.reload();
  await expect(page.getByLabel('Período de cobrança', { exact: true })).toHaveValue('week');
  await page.getByRole('button', { name: 'Para comprar', exact: true }).click();
  await expect(page.locator('.rental-badge')).toHaveCount(0);
  await page.goto('/anuncio/aluguel-1');
  await page.getByRole('button', { name: 'Solicitar aluguel', exact: true }).click();
  await verify(page);
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Data de retirada').fill('2026-12-15');
  await page.getByLabel('Data de devolução').fill('2026-12-18');
  await expect(page.locator('.rental-estimate')).toContainText('75');
  await page.getByRole('button', { name: 'Solicitar aluguel no chat' }).click();
  await expect(page.locator('.message-bubble.mine')).toContainText('15/12/2026');
  await expect(page.locator('.message-bubble.mine')).toContainText('Total estimado: R$ 75');
  await expect(page.locator('.message-bubble').last()).toContainText('Recebi sua solicitação de aluguel');
  await page.reload();
  await expect(page.locator('.message-bubble.mine')).toContainText('18/12/2026');
  for (const [id, end, expected] of [['aluguel-2', '2026-12-23', '130'], ['aluguel-3', '2027-01-15', '160']]) {
    await page.goto(`/anuncio/${id}`);
    await page.getByRole('button', { name: 'Solicitar aluguel', exact: true }).click();
    await page.getByLabel('Data de retirada').fill('2026-12-15');
    await page.getByLabel('Data de devolução').fill(end);
    await expect(page.locator('.rental-estimate>div').last()).toContainText(expected);
    if (id === 'aluguel-2') {
      await page.screenshot({ path: 'test-results/rental-desktop.png' });
      await page.setViewportSize({ width: 390, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
      await page.screenshot({ path: 'test-results/rental-mobile.png' });
    }
    await page.getByLabel('Data de devolução').fill('2026-12-14');
    await expect(page.getByRole('button', { name: 'Solicitar aluguel no chat' })).toBeDisabled();
  }
});

test('publicar e editar um item para aluguel', async ({ page }) => {
  await page.goto('/anunciar');
  await page.getByRole('button', { name: 'Quero alugar um item' }).click();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByLabel('Título do anúncio').fill('Monitor para alugar no hackathon');
  await page.getByLabel('Cobrança do aluguel').selectOption('week');
  await page.getByLabel('Valor do aluguel (R$)').fill('40.50');
  await page.getByLabel('Conte sobre o item').fill('Monitor disponível para aluguel durante a semana de projetos. Acompanha cabo HDMI e fonte, com retirada no campus.');
  await page.getByRole('button', { name: 'Usar foto demonstrativa 2' }).click();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByLabel('Bairro', { exact: true }).fill('Butantã');
  await page.getByLabel('Distância aproximada').fill('500');
  await page.getByRole('button', { name: 'Revisar meu anúncio' }).click();
  await expect(page.locator('.review-info')).toContainText('/semana');
  await page.getByRole('button', { name: 'Verificar vínculo e continuar' }).click();
  await verify(page);
  await page.getByRole('button', { name: 'Publicar anúncio' }).click();
  await page.getByRole('link', { name: 'Ver meu anúncio', exact: true }).click();
  await expect(page.locator('.contact-price')).toContainText('40,50');
  await expect(page.locator('.contact-price')).toContainText('/semana');
  await page.getByRole('link', { name: 'Editar meu anúncio' }).click();
  await expect(page.getByLabel('Finalidade do anúncio')).toHaveValue('rent');
  await expect(page.getByLabel('Cobrança do aluguel')).toHaveValue('week');
  await page.getByLabel('Cobrança do aluguel').selectOption('month');
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByRole('button', { name: 'Revisar meu anúncio' }).click();
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await page.goto('/desapego?modalidade=rent&periodo=month');
  await expect(page.getByRole('heading', { name: 'Monitor para alugar no hackathon' })).toBeVisible();
  await page.goto('/meu-espaco');
  const own = page.locator('.my-listing').filter({ hasText: 'Monitor para alugar no hackathon' });
  await expect(own).toContainText('ALUGUEL');
  await expect(own).toContainText('/mês');
});

test('migração preserva dados antigos e adiciona exemplos de aluguel', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => { const data = JSON.parse(localStorage.getItem('republik-demo-v1')!); delete data.schemaVersion; data.listings = data.listings.filter((l: { transaction?: string }) => l.transaction !== 'rent'); data.favorites = ['meu-1']; data.user.verified = true; data.listings.find((l: { id: string }) => l.id === 'meu-2').title = 'Meu anúncio preservado'; localStorage.setItem('republik-demo-v1', JSON.stringify(data)); });
  await page.reload();
  await page.goto('/desapego?modalidade=rent');
  await expect(page.locator('.listing-card')).toHaveCount(3);
  await page.goto('/meu-espaco');
  await expect(page.getByRole('heading', { name: 'Meu anúncio preservado' })).toBeVisible();
  await page.goto('/meu-espaco?aba=salvos');
  await expect(page.locator('.listing-card')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('.listing-card')).toHaveCount(1);
});

test('cálculo de diárias e blocos de semana ou mês', () => {
  expect(rentalQuote('2026-12-15', '2026-12-18', 25)).toEqual({ days: 3, units: 3, total: 75 });
  expect(rentalQuote('2026-12-15', '2026-12-22', 65, 'week')).toEqual({ days: 7, units: 1, total: 65 });
  expect(rentalQuote('2026-12-15', '2026-12-23', 65, 'week')).toEqual({ days: 8, units: 2, total: 130 });
  expect(rentalQuote('2026-12-15', '2027-01-15', 80, 'month')).toEqual({ days: 31, units: 2, total: 160 });
  expect(rentalQuote('2026-12-15', '2026-12-18', 12.35)).toEqual({ days: 3, units: 3, total: 37.05 });
  expect(rentalQuote('2026-12-15', '2026-12-15', 25)).toBeNull();
  expect(rentalQuote('2026-12-16', '2026-12-15', 25)).toBeNull();
  expect(rentalQuote('', '', 25)).toBeNull();
});
