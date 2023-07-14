
CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false
);

CREATE TABLE math_exam (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE exam_questions (
  id SERIAL PRIMARY KEY,
  setup_text TEXT,
  image_url_1 VARCHAR(255),
  image_url_2 VARCHAR(255),
  question_text TEXT,
  option_a_text TEXT,
  option_a_image_url TEXT,
  option_b_text TEXT,
  option_b_image_url TEXT,
  option_c_text TEXT,
  option_c_image_url TEXT,
  option_d_text TEXT,
  option_d_image_url TEXT,
  correct_answer TEXT NOT NULL, 
  math_exam_id INT,
  FOREIGN KEY (math_exam_id) REFERENCES math_exam(id) ON DELETE CASCADE
);

CREATE TABLE math_exam_questions (
  id SERIAL PRIMARY KEY,
  math_exam_id INT NOT NULL,
  question_id INT NOT NULL,
  FOREIGN KEY (math_exam_id) REFERENCES math_exam(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES exam_questions(id) ON DELETE CASCADE
);

