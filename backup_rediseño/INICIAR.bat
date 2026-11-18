@echo off
title LOGIX FASHION - Iniciar Sistema
echo ============================================================
echo   LOGIX FASHION - Sistema de Pedidos y Logistica
echo ============================================================
echo   1. Abrir Tienda Publica de Clientes (pedido)
echo   2. Abrir Panel Administrativo (admin)
echo   3. Abrir Ambos (Lado a Lado para prueba en tiempo real)
echo ============================================================
set /p opt="Elige una opcion (1, 2 o 3) y presiona Enter: "

if "%opt%"=="1" (
    start "" "%~dp0index.html"
) else if "%opt%"=="2" (
    start "" "%~dp0admin.html"
) else (
    start "" "%~dp0index.html"
    start "" "%~dp0admin.html"
)
exit
