ALTER TABLE conversationdiscovery.project ADD projectType enum('SYSTEM', 'MANUAL');
ALTER TABLE conversationdiscovery.project MODIFY projectName varchar(150);
ALTER TABLE conversationdiscovery.run MODIFY runName varchar(150);