ALTER TABLE `bienvenida`
  ADD COLUMN `subtitulo` varchar(150) DEFAULT NULL AFTER `titulo`,
  ADD COLUMN `despedida` varchar(255) DEFAULT NULL AFTER `descripcion`;
