-- In this SQL file, write (and comment!) the typical SQL queries users will run on your database

--creates an admin user
CREATE USER admin_user WITH PASSWORD 'admin_password';
--creates a student user
CREATE USER student_user WITH PASSWORD 'student_passowrd';

--grants necessary roles
GRANT admin_role TO admin_user;
GRANT school_role TO student_user;

--inserts a school called Mira Costa to table school
INSERT INTO school (school_uid, name, address, active, start_date, access_token)
VALUES (uuid_generate_v4(), 'Mira Costa High School', '1401 Artesia Blvd', TRUE, '2024-01-01', 'costa-tok');

--creates an administrator that is affiliated with Mira Costa
INSERT INTO administrator (person_uid, name, username, pwhash, phone_number, email, position, school_uid)
VALUES (uuid_generate_v4(), 'Dr. Gerger', 'gerger', 'hashed_password', '316', 'gerger@icloud.com', 'Principal', (SELECT school_uid FROM school WHERE name = 'Mira Costa High School'));

--sets admin_uid of Mira Costa in school table to this administrator
UPDATE school SET admin_uid = (SELECT person_uid FROM administrator WHERE username = 'gerger') WHERE name = 'Mira Costa High School';

--creates a user for this administrator, setting current_school_uid variable to Mira Costa
CREATE USER gerger WITH password 'doc';
GRANT school_role TO gerger;
SELECT set_school_uid('Mira Costa High School'); --sets gerger user's myapp.current_school_uid to 'Mira Costa High School's uid

--checks var
SELECT current_setting('myapp.current_school_uid');


--creates a user_session for this user, marking the login time
INSERT INTO user_session(session_uid, login, ip_address, active, session_token, person_uid)
VALUES (uuid_generate_v4(), NOW(), inet_client_addr(), TRUE, 'new_tok', (SELECT person_uid FROM administrator WHERE name = 'Dr. Gerger'));

--inserts 3 schools into school table
INSERT INTO school (school_uid, name, address, active, start_date, access_token)
VALUES (uuid_generate_v4(), 'University of Maryland', '14 College Park Row', TRUE, '2024-01-05', 'umd-tok');

INSERT INTO school (school_uid, name, address, active, start_date, access_token)
VALUES (uuid_generate_v4(), 'University of Wisconsin', '15 Wisco Row', TRUE, '2024-01-10', 'wisco-tok');

INSERT INTO school (school_uid, name, address, active, start_date, access_token)
VALUES (uuid_generate_v4(), 'University of Colorado, Boulder', '16 Boulder Blvd', TRUE, '2024-04-01', 'boulder-tok');

--inserts 6 students into student table (and person table), affiliated with the above schools
INSERT INTO student (person_uid, name, username, pwhash, phone_number, email, student_id, school_uid)
VALUES (uuid_generate_v4(), 'Miles McDonald', 'miles', 'hashed_password', '310', 'miles@icloud.com', 119709979, (SELECT school_uid FROM school WHERE name = 'University of Maryland'));

INSERT INTO student (person_uid, name, username, pwhash, phone_number, email, student_id, school_uid)
VALUES (uuid_generate_v4(), 'Megan McDonald', 'megan', 'hashed_password', '311', 'megan@icloud.com', 90002550, (SELECT school_uid FROM school WHERE name = 'Mira Costa High School'));

INSERT INTO student (person_uid, name, username, pwhash, phone_number, email, student_id, school_uid)
VALUES (uuid_generate_v4(), 'Juju Arensdorf', 'juju', 'hashed_password', '312', 'juju@icloud.com', 4302937, (SELECT school_uid FROM school WHERE name = 'Mira Costa High School'));

INSERT INTO student (person_uid, name, username, pwhash, phone_number, email, student_id, school_uid)
VALUES (uuid_generate_v4(), 'Luke Mckendry', 'luke', 'hashed_password', '316', 'luke@icloud.com', 43029373, (SELECT school_uid FROM school WHERE name = 'Mira Costa High School'));

INSERT INTO student (person_uid, name, username, pwhash, phone_number, email, student_id, school_uid)
VALUES (uuid_generate_v4(), 'Jack Jones', 'jack', 'hashed_password', '317', 'jack@icloud.com', 430293337, (SELECT school_uid FROM school WHERE name = 'Mira Costa High School'));

INSERT INTO student (person_uid, name, username, pwhash, phone_number, email, student_id, school_uid)
VALUES (uuid_generate_v4(), 'Jonah Miller', 'jonah', 'hashed_password', '313', 'jonah@icloud.com', 43029337, (SELECT school_uid FROM school WHERE name = 'University of Wisconsin'));

--inserts 3 guardians into guardian table (and person table), affiliated with above students
INSERT INTO guardian (person_uid, name, username, pwhash, phone_number, email, child_uid, affiliation, school_uid)
VALUES (uuid_generate_v4(), 'Lorie McDonald', 'lorie', 'hashed_password', '314', 'lorie@icloud.com', (SELECT person_uid FROM student WHERE name = 'Megan McDonald'), 'Mother', (SELECT school_uid FROM school Where name = 'Mira Costa High School'));

INSERT INTO guardian (person_uid, name, username, pwhash, phone_number, email, child_uid, affiliation, school_uid)
VALUES (uuid_generate_v4(), 'Deanne Miller', 'deanne', 'hashed_password', '315', 'deanne@icloud.com', (SELECT person_uid FROM student WHERE name = 'Jonah Miller'), 'Mother', (SELECT school_uid FROM school Where name = 'University of Wisconsin'));

INSERT INTO guardian (person_uid, name, username, pwhash, phone_number, email, child_uid, affiliation, school_uid)
VALUES (uuid_generate_v4(), 'Kelly Mckendry', 'kelly', 'hashed_password', '318', 'kelly@icloud.com', (SELECT person_uid FROM student WHERE name = 'Luke Mckendry'), 'Mother', (SELECT school_uid FROM school Where name = 'Mira Costa High School'));

--inserts 1 more person, not of a type
INSERT INTO person (person_uid, name, username, pwhash, phone_number, email, school_uid)
VALUES (uuid_generate_v4(), 'Josh Jobs', 'josh', 'hashed_password', '340', 'josh@icloud.com', (SELECT school_uid FROM school WHERE name = 'Mira Costa High School'));

--checks all subtables, that all included in person
SELECT * FROM student;

SELECT * FROM guardian;

SELECT * FROM administrator;

SELECT * FROM person;

--inserts an active emergency_event at Mira Costa
INSERT INTO emergency_event (event_uid, timestamp, status, event_type, description, school_uid)
VALUES (uuid_generate_v4(), NOW(), TRUE, 'School Shooting', 'tbd', (SELECT school_uid FROM school WHERE name = 'Mira Costa High School'));

SELECT * FROM active_emergency_events;

--inserts geolocations for 3 students at Mira Costa
INSERT INTO geolocation (location_uid, timestamp, geom, status, student_uid)
VALUES (uuid_generate_v4(), NOW(), ST_GeogFromText('SRID=4326;POINT(-118.2897 34.0202)'), 'Safe', (SELECT person_uid FROM student WHERE name = 'Juju Arensdorf'));

INSERT INTO geolocation (location_uid, timestamp, geom, status, student_uid)
VALUES (uuid_generate_v4(), NOW(), ST_GeogFromText('SRID=4326;POINT(-135.2897 20.0202)'), 'In Danger', (SELECT person_uid FROM student WHERE name = 'Luke Mckendry'));

INSERT INTO geolocation (location_uid, timestamp, geom, status, student_uid)
VALUES (uuid_generate_v4(), NOW(), ST_GeogFromText('SRID=4326;POINT(-200.2897 35.0202)'), 'Moving', (SELECT person_uid FROM student WHERE name = 'Jack Jones'));

SELECT * FROM school_geolocations;

--emergency event over, sets status to false for current school (Mira Costa)
UPDATE emergency_event SET status = FALSE WHERE school_uid = current_setting('myapp.current_school_uid')::UUID;

--2 discussion posts posted, with information and affiliated to a student
INSERT INTO discussion_post (post_uid, subject, timestamp, type, description, likes, dislikes, verified, person_uid)
VALUES (uuid_generate_v4(), 'Emergency Over', NOW(), 'School Shooting', 'We all good now', 0, 0, FALSE, (SELECT person_uid FROM person WHERE name = 'Luke Mckendry'));

INSERT INTO discussion_post (post_uid, subject, timestamp, type, description, likes, dislikes, verified, person_uid)
VALUES (uuid_generate_v4(), 'Thank God Emergency Over', NOW(), 'School Shooting', 'Everyone safe?', 0, 0, FALSE, (SELECT person_uid FROM person WHERE name = 'Josh Jobs'));


SELECT * FROM discussion_post;

--sets logout, and inactive for this session
UPDATE user_session SET logout = NOW(), active = FALSE WHERE person_uid = (SELECT person_uid FROM person WHERE name = 'Dr. Gerger');



