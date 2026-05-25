ALTER TABLE administrador
ADD COLUMN token_recuperacion VARCHAR(64) DEFAULT NULL AFTER correo,
ADD COLUMN expiracion_token DATETIME DEFAULT NULL AFTER token_recuperacion;
