CREATE TABLE Questions(id int AUTO_INCREMENT , question_text text, option1 varchar(2000), option2 varchar(2000), option3 varchar(2000), option4 varchar(2000), correct_option int, explaination text, PRIMARY KEY (id)); 
CREATE TABLE Users(email varchar(200), password varchar(2000), account_type varchar(100), PRIMARY KEY (email));
CREATE TABLE Scores(student_name varchar(200), user_correct int, user_total int);

INSERT INTO Users(email, password, account_type) VALUES('kkdfuturestar@gmail.com', 'kaykay21', 'student');
INSERT INTO Users(email, password, account_type) VALUES('some_professor@gmail.com', 'abc123', 'professor');

INSERT INTO Scores(student_name, user_correct, user_total) VALUES('KAJOL', 8, 10)
INSERT INTO Questions(question_text, option1, option2, option3, option4, correct_option, explaination) VALUES ('An index is clustered, if', 'it is on a set of fields that form a candidate key', 'it is on a set of fields that include the primary key', 'the data records of the file are organized in the same order as the data entries of the index', 'the data records of the file are organized not in the same order as the data entries of the index', 3, 'A database index is clustered if physical records on disk follow the index order');


INSERT INTO Questions(question_text, option1, option2, option3, option4, correct_option, explaination) VALUES ('Consider a B+-tree in which the maximum number of keys in a node is 5. What is the minimum number of keys in any non-root node', '1', '2','3','4', 2, 'Since the maximum number of keys is 5, maximum number of children a node can have is 6. By definition of B Tree, minimum children that a node can have would be 6/2 = 3. Therefore, minimum number of keys that a node can have becomes 2 (3-1)');

INSERT INTO Questions(question_text, option1, option2, option3, option4, correct_option, explaination) VALUES ('A clustering index is defined on the fields which are of type', 'non-key and ordering', 'non-key and non-ordering', 'key and ordering','key and non-ordering', 1, 'to create clustered index files, fields could be non-key attributes and which are in ordered form so as to form clusters easily');

INSERT INTO Questions(question_text, option1, option2, option3, option4, correct_option, explaination) VALUES ('In the index allocation scheme of blocks to a file, the maximum possible size of the file depends on :', 'the size of the blocks, and the size of the ad­dress of the blocks','the number of blocks used for the index, and the size of the blocks' ,'the size of the blocks, the number of blocks used for the index, and the size of the address of the blocks' ,'None of these', 2, 'When indexes are created, the maximum number of blocks given to a file depends upon the size of the index which tells how many blocks can be there and size of each block(i.e. same as depending upon the number of blocks for storing the indexes and size of each index block)');