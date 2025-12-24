--
-- PostgreSQL database dump
--

\restrict N7b5TlJAIH65vK0fo0UCIMxqc9KvElZ8kDkK3WYxFenjdLTbQ5AWbYbLAw6ORwK

-- Dumped from database version 17.5
-- Dumped by pg_dump version 18.0

-- Started on 2025-12-25 01:44:00

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 6 (class 2615 OID 17722)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 5049 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 2 (class 3079 OID 17723)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5051 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 897 (class 1247 OID 17761)
-- Name: day_of_week_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.day_of_week_enum AS ENUM (
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
    'Воскресенье'
);


ALTER TYPE public.day_of_week_enum OWNER TO postgres;

--
-- TOC entry 900 (class 1247 OID 17776)
-- Name: duration_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.duration_enum AS ENUM (
    'нет абонемента',
    'разовый',
    '1 месяц',
    '3 месяца',
    '6 месяцев',
    '1 год'
);


ALTER TYPE public.duration_enum OWNER TO postgres;

--
-- TOC entry 903 (class 1247 OID 17790)
-- Name: membership_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.membership_type_enum AS ENUM (
    'нет абонемента',
    'дневной',
    'стандарт',
    'безлимит'
);


ALTER TYPE public.membership_type_enum OWNER TO postgres;

--
-- TOC entry 906 (class 1247 OID 17800)
-- Name: special_group_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.special_group_enum AS ENUM (
    'нет абонемента',
    'стандарт',
    'золотой возраст'
);


ALTER TYPE public.special_group_enum OWNER TO postgres;

--
-- TOC entry 909 (class 1247 OID 17808)
-- Name: status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_enum AS ENUM (
    '0',
    '1'
);


ALTER TYPE public.status_enum OWNER TO postgres;

--
-- TOC entry 276 (class 1255 OID 17813)
-- Name: create_visitor(uuid, character varying, character varying, character varying, uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_visitor(v_id uuid, v_name character varying, v_surname character varying, v_phone_number character varying, vm_membership_id uuid, vm_id uuid) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    m_duration duration_enum;
BEGIN
    -- Получаем длительность абонемента
    SELECT duration INTO m_duration
    FROM gym_memberships
    WHERE id = vm_membership_id;

    -- Вставляем нового пользователя
    INSERT INTO visitor_users (id, username, usersurname, phone_number)
    VALUES (v_id, v_name, v_surname, v_phone_number);

    -- Вставляем информацию об абонементе
    INSERT INTO visitor_memberships (id, visitor_id, membership_id, visits_left)
    VALUES (
        vm_id,
        v_id,
        vm_membership_id,
        CASE m_duration
            WHEN 'разовый' THEN 1
            WHEN '1 месяц' THEN 12
            WHEN '3 месяца' THEN 36
            WHEN '6 месяцев' THEN 72
            WHEN '1 год' THEN 144
            ELSE 0
        END
    );

    RETURN 1; -- статус успеха
END;
$$;


ALTER FUNCTION public.create_visitor(v_id uuid, v_name character varying, v_surname character varying, v_phone_number character varying, vm_membership_id uuid, vm_id uuid) OWNER TO postgres;

--
-- TOC entry 277 (class 1255 OID 17814)
-- Name: delete_visitor(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_visitor(v_id uuid) RETURNS integer
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Удаляем абонементы
    DELETE FROM visitor_memberships WHERE visitor_id = v_id;
    
    -- Удаляем пользователя
    DELETE FROM visitor_users WHERE id = v_id;

    RETURN 1; -- статус успеха
END;
$$;


ALTER FUNCTION public.delete_visitor(v_id uuid) OWNER TO postgres;

--
-- TOC entry 278 (class 1255 OID 17815)
-- Name: insert_otp(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_otp(p_phone character varying, p_otp character varying) RETURNS integer
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Вставка или обновление OTP
    INSERT INTO visitor_otp (id, phone_number, otp, expires_at)
    VALUES (gen_random_uuid(), p_phone, p_otp, NOW() + INTERVAL '5 minutes')
    ON CONFLICT (phone_number) DO UPDATE
      SET otp = EXCLUDED.otp,
          expires_at = EXCLUDED.expires_at;

    RETURN 1; -- статус успеха
END;
$$;


ALTER FUNCTION public.insert_otp(p_phone character varying, p_otp character varying) OWNER TO postgres;

--
-- TOC entry 279 (class 1255 OID 17816)
-- Name: update_visitor(uuid, character varying, character varying, character varying, uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_visitor(v_id uuid, v_name character varying, v_surname character varying, v_phone_number character varying, vm_membership_id uuid, vm_id uuid) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    m_duration duration_enum;
BEGIN
    -- Получаем длительность абонемента
    SELECT duration INTO m_duration
    FROM gym_memberships
    WHERE id = vm_membership_id;

    -- Обновляем данные пользователя
    UPDATE visitor_users
    SET username = v_name,
        usersurname = v_surname,
        phone_number = v_phone_number
    WHERE id = v_id;

    -- Обновляем информацию об абонементе
    UPDATE visitor_memberships
    SET membership_id = vm_membership_id,
        visits_left = CASE m_duration
            WHEN 'разовый' THEN 1
            WHEN '1 месяц' THEN 12
            WHEN '3 месяца' THEN 36
            WHEN '6 месяцев' THEN 72
            WHEN '1 год' THEN 144
            ELSE 0
        END
    WHERE id = vm_id AND visitor_id = v_id;

    RETURN 1; -- статус успеха
END;
$$;


ALTER FUNCTION public.update_visitor(v_id uuid, v_name character varying, v_surname character varying, v_phone_number character varying, vm_membership_id uuid, vm_id uuid) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 17817)
-- Name: admin_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    login character varying(256),
    password character varying(256) NOT NULL
);


ALTER TABLE public.admin_users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 17823)
-- Name: gym_memberships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gym_memberships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    membership_type public.membership_type_enum,
    duration public.duration_enum,
    price numeric(10,2) NOT NULL,
    special_group public.special_group_enum
);


ALTER TABLE public.gym_memberships OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 17827)
-- Name: schedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schedule (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    day_of_week public.day_of_week_enum NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    training_type_id uuid NOT NULL,
    room_name character varying(50) NOT NULL,
    trainer uuid,
    category character varying(50) NOT NULL
);


ALTER TABLE public.schedule OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17831)
-- Name: trainer_photos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trainer_photos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    photo_url character varying(256),
    trainer_id uuid
);


ALTER TABLE public.trainer_photos OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 17835)
-- Name: trainers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trainers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(128) NOT NULL,
    surname character varying(128) NOT NULL,
    training_type uuid,
    telephone_number character varying(11),
    instagram character varying(256),
    telegram character varying(256),
    whatsapp character varying(256),
    description character varying(256)
);


ALTER TABLE public.trainers OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17841)
-- Name: training_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.training_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    training_name character varying(100) NOT NULL,
    description text
);


ALTER TABLE public.training_types OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 17847)
-- Name: visitor_analytics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visitor_analytics (
    visitor_id uuid NOT NULL,
    visits_count integer DEFAULT 0 NOT NULL,
    avg_check numeric(10,2),
    last_visit_date date,
    churn_risk character varying(10) DEFAULT 'low'::character varying NOT NULL,
    CONSTRAINT chk_churn_risk CHECK (((churn_risk)::text = ANY (ARRAY[('low'::character varying)::text, ('medium'::character varying)::text, ('high'::character varying)::text])))
);


ALTER TABLE public.visitor_analytics OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17853)
-- Name: visitor_memberships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visitor_memberships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    visitor_id uuid NOT NULL,
    membership_id uuid NOT NULL,
    visits_left integer
);


ALTER TABLE public.visitor_memberships OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 17857)
-- Name: visitor_otp; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visitor_otp (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    phone_number character varying(11) NOT NULL,
    otp character varying(6) NOT NULL,
    expires_at timestamp without time zone NOT NULL
);


ALTER TABLE public.visitor_otp OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17861)
-- Name: visitor_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visitor_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying(256) NOT NULL,
    usersurname character varying(256) NOT NULL,
    phone_number character varying(11) NOT NULL,
    status public.status_enum DEFAULT '1'::public.status_enum NOT NULL
);


ALTER TABLE public.visitor_users OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 17868)
-- Name: visits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    visitor_id uuid NOT NULL,
    membership_id uuid NOT NULL,
    visit_date timestamp without time zone NOT NULL,
    price numeric(10,2)
);


ALTER TABLE public.visits OWNER TO postgres;

--
-- TOC entry 5033 (class 0 OID 17817)
-- Dependencies: 218
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_users (id, login, password) FROM stdin;
a896e780-1b24-481b-b655-7b4aecd70efb	admin	adminpass
\.


--
-- TOC entry 5034 (class 0 OID 17823)
-- Dependencies: 219
-- Data for Name: gym_memberships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gym_memberships (id, membership_type, duration, price, special_group) FROM stdin;
4a940c67-c505-467c-80cd-d0581106746b	стандарт	3 месяца	36000.00	стандарт
4dca661d-3296-4ad0-a4c2-d27d8ec55cc9	дневной	3 месяца	26000.00	стандарт
a5cbd8e6-6792-4e2e-a892-5d20f3a48f16	дневной	1 месяц	8000.00	золотой возраст
cc76803b-9062-481b-a4cd-7e5d5fdb5105	стандарт	6 месяцев	63000.00	стандарт
26075976-48a6-45a3-8b2d-b1f6d0552c20	безлимит	1 месяц	21000.00	стандарт
869b51e3-f7a3-4a23-a53c-780775cc2127	стандарт	1 месяц	15000.00	стандарт
3ac91bfb-bda2-45c7-b465-bd53f3084433	дневной	6 месяцев	46000.00	стандарт
3b06fb61-7bb7-4658-8179-1efa51ae1d9e	стандарт	1 месяц	11000.00	золотой возраст
cfb36396-cc64-4d95-b08d-6264e46f9f5c	дневной	1 месяц	11000.00	стандарт
3a28fd87-6a2e-462a-8806-e70240cc8030	стандарт	1 год	108000.00	стандарт
dff55ac3-cbee-4c7e-a174-53922280b3f4	нет абонемента	нет абонемента	0.00	нет абонемента
bfd73475-0144-42b7-b478-2f62504f6f58	дневной	разовый	3000.00	стандарт
264dbb54-919d-4c4d-8f61-dd86e9e84e74	дневной	1 год	79000.00	стандарт
c4b5a2fa-20d4-4b32-b244-94b3cc552492	стандарт	разовый	4000.00	стандарт
16120eda-5442-463d-aba2-8ece57dc9b79	дневной	3 месяца	25000.00	стандарт
\.


--
-- TOC entry 5035 (class 0 OID 17827)
-- Dependencies: 220
-- Data for Name: schedule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schedule (id, day_of_week, start_time, end_time, training_type_id, room_name, trainer, category) FROM stdin;
c686c2f7-c7fb-4177-8261-e8c7a8385f40	Понедельник	10:30:00	11:30:00	0e260bea-9b8e-4c62-9cf9-c41504fd8ee4	2	a08393dc-44a7-4240-a129-62b5aaab7e29	Взрослые
9276cb9f-1abc-4211-93ce-7a08bea365dd	Понедельник	09:00:00	10:00:00	c75e294c-2f46-4702-bd3a-31ca127c1916	1	ce852205-425a-495a-9e2e-a4863771086f	Взрослые
3eacc6f9-462b-4b68-b1c7-0a8f986d516f	Пятница	17:00:00	18:00:00	c75e294c-2f46-4702-bd3a-31ca127c1916	3	ce852205-425a-495a-9e2e-a4863771086f	Взрослые
56797349-b079-4a50-8a64-008cacff5b35	Вторник	18:00:00	19:00:00	50031cf7-199e-4ad0-8b36-a5b34394bd05	1	5e3c357a-1d87-4ca6-8750-1eb98725c413	Дети
6b982caa-47c0-4911-afc7-2250bda2f6df	Среда	19:00:00	20:00:00	3b7ab693-eea7-4ce0-a521-770ab04cc6bf	2	fe0a6b2e-8bb0-4f4a-8203-3b2ccaea97d2	Дети
\.


--
-- TOC entry 5036 (class 0 OID 17831)
-- Dependencies: 221
-- Data for Name: trainer_photos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trainer_photos (id, photo_url, trainer_id) FROM stdin;
dd6f63f9-ee03-445a-b854-f61c53e21111	/img/900d8887-d420-4392-a404-6fc808de0440_0.png	900d8887-d420-4392-a404-6fc808de0440
bcb12dc7-c986-45f0-84f8-853f021007a9	/img/900d8887-d420-4392-a404-6fc808de0440_1.png	900d8887-d420-4392-a404-6fc808de0440
01f9d41e-b178-4707-8470-45259be940d5	/img/900d8887-d420-4392-a404-6fc808de0440_2.png	900d8887-d420-4392-a404-6fc808de0440
0478f506-54cf-493a-bfd1-d8ec7dad25ca	/img/a5094a6f-a6b4-45ba-9a5a-07ed8b7f44cd_0.png	a5094a6f-a6b4-45ba-9a5a-07ed8b7f44cd
06e11ece-e002-4a5c-a489-d747010cd382	/img/a5094a6f-a6b4-45ba-9a5a-07ed8b7f44cd_1.png	a5094a6f-a6b4-45ba-9a5a-07ed8b7f44cd
\.


--
-- TOC entry 5037 (class 0 OID 17835)
-- Dependencies: 222
-- Data for Name: trainers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trainers (id, name, surname, training_type, telephone_number, instagram, telegram, whatsapp, description) FROM stdin;
a5094a6f-a6b4-45ba-9a5a-07ed8b7f44cd	Константин	Петренко	11bdfb06-de80-45d6-abb4-717e631d37bc	22222222222	https://www.instagram.com/p0fig1st?igsh=MzB1a2tsaXlzdGw1	t.me/decter1o	https://wa.me/qr/EHQJP34W2Q4SG1	weqweqwe
900d8887-d420-4392-a404-6fc808de0440	Иван	Иванов	3d9eb945-4699-4a67-8ab0-12f7b42e24e5	78649523698	insta	telega	wp	qweqeqweqweqwe
ce852205-425a-495a-9e2e-a4863771086f	Алексей	Смирнов	c75e294c-2f46-4702-bd3a-31ca127c1916	79111234567	alex_crossfit	@alex_trainer	79111234567	Опытный тренер по кроссфиту
a08393dc-44a7-4240-a129-62b5aaab7e29	Мария	Иванова	0e260bea-9b8e-4c62-9cf9-c41504fd8ee4	79222345678	maria_pilates	@maria_pilates	79222345678	Сертифицированный инструктор пилатеса
5e3c357a-1d87-4ca6-8750-1eb98725c413	Дмитрий	Петров	50031cf7-199e-4ad0-8b36-a5b34394bd05	79333456789	dmitry_boxing	@dmitry_box	79333456789	Чемпион города по боксу
fe0a6b2e-8bb0-4f4a-8203-3b2ccaea97d2	Анна	Сидорова	3b7ab693-eea7-4ce0-a521-770ab04cc6bf	79444567890	anna_stretch	@anna_flex	79444567890	Инструктор по стретчингу и йоге
\.


--
-- TOC entry 5038 (class 0 OID 17841)
-- Dependencies: 223
-- Data for Name: training_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.training_types (id, training_name, description) FROM stdin;
66f36489-d0f9-411f-8a05-ae91013da61d	Fitness Intensive	Интенсивная тренировка для всех уровней подготовки.
1e4056f5-8dd0-437a-80c3-c6c322da704b	Женская самооборона	Тренировка по самообороне для женщин.
11bdfb06-de80-45d6-abb4-717e631d37bc	Йога	Занятие йогой для всех уровней.
74639650-157d-4be6-9c56-7557093e64a3	Primary Girl	Тренировка для девочек от 13 до 15 лет.
3d9eb945-4699-4a67-8ab0-12f7b42e24e5	Подростковый фитнес	Фитнес тренировка для подростков от 10 до 15 лет.
c75e294c-2f46-4702-bd3a-31ca127c1916	Кроссфит	Высокоинтенсивные функциональные тренировки
0e260bea-9b8e-4c62-9cf9-c41504fd8ee4	Пилатес	Упражнения для укрепления мышц кора
50031cf7-199e-4ad0-8b36-a5b34394bd05	Бокс	Тренировки по боксу для всех уровней
3b7ab693-eea7-4ce0-a521-770ab04cc6bf	Стретчинг	Упражнения на растяжку и гибкость
15a55102-914a-4137-8cb8-e5f0d69d71b5	TRX	Тренировки с петлями TRX
0dc92a60-1b02-401d-ae87-bbce88cc9551	Танцы	Современные танцевальные направления
d50d9a45-bb2c-47ae-a5c9-c18545472cbd	Йога для начинающих	Основы йоги для новичков
49db7c77-d6ee-4178-b4e8-cd5f3fdc5153	Силовая тренировка	Работа с весами для набора мышечной массы
\.


--
-- TOC entry 5039 (class 0 OID 17847)
-- Dependencies: 224
-- Data for Name: visitor_analytics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visitor_analytics (visitor_id, visits_count, avg_check, last_visit_date, churn_risk) FROM stdin;
32dc7f61-ecf4-48e5-af8f-1a356bbe295c	6	2999.14	2025-12-23	low
9b697165-9ca8-44d3-b4c4-36fabddb6b86	6	763.33	2025-12-23	low
85083252-ba67-457a-ae03-12f143b22f76	6	1756.23	2025-12-17	medium
52e3f223-8d75-46f8-845a-b738a705bad5	6	751.95	2025-12-21	low
8a813b7b-c5b1-4ae5-bfc8-12b557e80f5f	6	2993.41	2025-12-20	low
\.


--
-- TOC entry 5040 (class 0 OID 17853)
-- Dependencies: 225
-- Data for Name: visitor_memberships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visitor_memberships (id, visitor_id, membership_id, visits_left) FROM stdin;
fce0590f-701a-4cd9-b838-4ce3f6d4d827	72b52d0c-d1ad-441d-a313-565f242a40bf	a5cbd8e6-6792-4e2e-a892-5d20f3a48f16	12
98111672-bd29-4d18-8230-6725c042f360	8e65989f-db7c-41ad-a6ed-5ca7d2d6681a	26075976-48a6-45a3-8b2d-b1f6d0552c20	12
11b1a9d2-0255-41ac-badd-1403e20c65c6	9b697165-9ca8-44d3-b4c4-36fabddb6b86	a5cbd8e6-6792-4e2e-a892-5d20f3a48f16	12
b22c5542-8a15-4ec1-9829-e6576218a37d	32dc7f61-ecf4-48e5-af8f-1a356bbe295c	4a940c67-c505-467c-80cd-d0581106746b	36
bc5a1330-1621-4941-a556-bfebb4d6d2e1	52e3f223-8d75-46f8-845a-b738a705bad5	a5cbd8e6-6792-4e2e-a892-5d20f3a48f16	12
2fa691af-9cea-4c38-9dd6-28a61319ee15	8a813b7b-c5b1-4ae5-bfc8-12b557e80f5f	4a940c67-c505-467c-80cd-d0581106746b	36
421d61cb-54dd-41e4-947c-23427260352f	89e3380c-a6d8-4a86-9a5d-cad256531a52	cc76803b-9062-481b-a4cd-7e5d5fdb5105	72
87f3a503-f673-40d1-bb32-b9cf32acd633	85083252-ba67-457a-ae03-12f143b22f76	264dbb54-919d-4c4d-8f61-dd86e9e84e74	144
7cd8f91b-3390-4b26-a0c5-279850548f2d	623a046d-c1f8-41b9-a1cf-bfd0acb4424c	3ac91bfb-bda2-45c7-b465-bd53f3084433	72
\.


--
-- TOC entry 5041 (class 0 OID 17857)
-- Dependencies: 226
-- Data for Name: visitor_otp; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visitor_otp (id, phone_number, otp, expires_at) FROM stdin;
bf35c164-0947-4086-91b2-46d9fae31e5c	77478267536	QNKSIM	2025-12-07 17:20:49.798063
\.


--
-- TOC entry 5042 (class 0 OID 17861)
-- Dependencies: 227
-- Data for Name: visitor_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visitor_users (id, username, usersurname, phone_number, status) FROM stdin;
8e65989f-db7c-41ad-a6ed-5ca7d2d6681a	Кирилл	Трищ	78649523698	1
72b52d0c-d1ad-441d-a313-565f242a40bf	Алмаз	Нуржанов	77715411412	1
9b697165-9ca8-44d3-b4c4-36fabddb6b86	Иван	Кузнецов	79151234567	1
32dc7f61-ecf4-48e5-af8f-1a356bbe295c	Елена	Васнецова	79261234567	1
52e3f223-8d75-46f8-845a-b738a705bad5	Ольга	Соколова	79481234567	1
8a813b7b-c5b1-4ae5-bfc8-12b557e80f5f	Александр	Лебедев	79591234567	1
89e3380c-a6d8-4a86-9a5d-cad256531a52	Константин	Петренко	77478267536	1
85083252-ba67-457a-ae03-12f143b22f76	Сергей	Орлов	79371234567	1
623a046d-c1f8-41b9-a1cf-bfd0acb4424c	Павел	Жуков	79711234567	1
\.


--
-- TOC entry 5043 (class 0 OID 17868)
-- Dependencies: 228
-- Data for Name: visits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visits (id, visitor_id, membership_id, visit_date, price) FROM stdin;
17cf592c-ad69-4ee2-b9b9-6e8c0870c1b3	9b697165-9ca8-44d3-b4c4-36fabddb6b86	a5cbd8e6-6792-4e2e-a892-5d20f3a48f16	2025-12-23 00:00:00	716.06
b6fec0a1-0fd7-4a64-bbc7-f3b10c41a792	9b697165-9ca8-44d3-b4c4-36fabddb6b86	a5cbd8e6-6792-4e2e-a892-5d20f3a48f16	2025-12-02 00:00:00	832.13
504a5d18-8a10-4059-80ca-7f4aac0c7bc1	9b697165-9ca8-44d3-b4c4-36fabddb6b86	a5cbd8e6-6792-4e2e-a892-5d20f3a48f16	2025-12-09 00:00:00	678.67
7bb169fc-bd98-4256-a279-c5a0f30dd4ed	9b697165-9ca8-44d3-b4c4-36fabddb6b86	a5cbd8e6-6792-4e2e-a892-5d20f3a48f16	2025-12-03 00:00:00	747.28
d8d09dac-33f6-4427-b013-5455d9315529	9b697165-9ca8-44d3-b4c4-36fabddb6b86	a5cbd8e6-6792-4e2e-a892-5d20f3a48f16	2025-12-04 00:00:00	766.88
90fac986-bcc3-41fc-a930-9a0010c590b3	9b697165-9ca8-44d3-b4c4-36fabddb6b86	a5cbd8e6-6792-4e2e-a892-5d20f3a48f16	2025-12-07 00:00:00	838.94
5b01b13f-703e-441e-b514-9da3aaa7f2a2	32dc7f61-ecf4-48e5-af8f-1a356bbe295c	4a940c67-c505-467c-80cd-d0581106746b	2025-12-07 00:00:00	3059.66
6ed02c2f-0160-4d7e-92cc-2f2075860e12	32dc7f61-ecf4-48e5-af8f-1a356bbe295c	4a940c67-c505-467c-80cd-d0581106746b	2025-12-18 00:00:00	3057.61
44b71828-fff7-4900-8aa4-c56d74629fe9	32dc7f61-ecf4-48e5-af8f-1a356bbe295c	4a940c67-c505-467c-80cd-d0581106746b	2025-12-10 00:00:00	2996.01
5d15f8e2-ec09-46cd-b390-340925c8fd5b	32dc7f61-ecf4-48e5-af8f-1a356bbe295c	4a940c67-c505-467c-80cd-d0581106746b	2025-12-06 00:00:00	3041.38
b519ce2b-098f-4304-849a-a485392c4d22	32dc7f61-ecf4-48e5-af8f-1a356bbe295c	4a940c67-c505-467c-80cd-d0581106746b	2025-12-23 00:00:00	2886.88
ec489362-5888-489b-a456-6e7ca82a91f4	32dc7f61-ecf4-48e5-af8f-1a356bbe295c	4a940c67-c505-467c-80cd-d0581106746b	2025-12-05 00:00:00	2953.32
84c30f5b-d240-45a7-88bc-668ffbe32aaf	85083252-ba67-457a-ae03-12f143b22f76	26075976-48a6-45a3-8b2d-b1f6d0552c20	2025-12-15 00:00:00	1702.57
96d56795-6f0a-4428-ac15-05842a60acb5	85083252-ba67-457a-ae03-12f143b22f76	26075976-48a6-45a3-8b2d-b1f6d0552c20	2025-12-11 00:00:00	1757.99
f356e581-1d20-48e9-8178-d8d578a652f7	85083252-ba67-457a-ae03-12f143b22f76	26075976-48a6-45a3-8b2d-b1f6d0552c20	2025-12-12 00:00:00	1799.50
12e403d3-09cd-4506-9398-e34934aa7f75	85083252-ba67-457a-ae03-12f143b22f76	26075976-48a6-45a3-8b2d-b1f6d0552c20	2025-12-13 00:00:00	1682.82
f419c316-af76-4771-acfa-b2906113fcd8	85083252-ba67-457a-ae03-12f143b22f76	26075976-48a6-45a3-8b2d-b1f6d0552c20	2025-12-17 00:00:00	1861.05
62011295-2b73-45ae-b165-af01accea1f5	85083252-ba67-457a-ae03-12f143b22f76	26075976-48a6-45a3-8b2d-b1f6d0552c20	2025-12-10 00:00:00	1733.47
c148b782-c583-4bb6-89e6-85e48d342e38	52e3f223-8d75-46f8-845a-b738a705bad5	a5cbd8e6-6792-4e2e-a892-5d20f3a48f16	2025-12-21 00:00:00	735.64
11f8ccda-0dc6-48c7-bc9d-67d5bd542aad	52e3f223-8d75-46f8-845a-b738a705bad5	a5cbd8e6-6792-4e2e-a892-5d20f3a48f16	2025-11-29 00:00:00	751.59
5503f32a-7c97-45d8-917f-10134491990a	52e3f223-8d75-46f8-845a-b738a705bad5	a5cbd8e6-6792-4e2e-a892-5d20f3a48f16	2025-11-25 00:00:00	827.86
771c0fa6-5a1b-49d0-9fe0-37deebe636e8	52e3f223-8d75-46f8-845a-b738a705bad5	a5cbd8e6-6792-4e2e-a892-5d20f3a48f16	2025-11-30 00:00:00	700.69
28a6ef48-e19e-4c70-afc7-c494f84fd7af	52e3f223-8d75-46f8-845a-b738a705bad5	a5cbd8e6-6792-4e2e-a892-5d20f3a48f16	2025-12-16 00:00:00	693.20
e859af44-14fd-4c51-8231-48906b144723	52e3f223-8d75-46f8-845a-b738a705bad5	a5cbd8e6-6792-4e2e-a892-5d20f3a48f16	2025-12-09 00:00:00	802.74
223bb8fd-3e3a-4aa6-84f6-774d1251b782	8a813b7b-c5b1-4ae5-bfc8-12b557e80f5f	4a940c67-c505-467c-80cd-d0581106746b	2025-12-20 00:00:00	3004.39
2005e43c-db71-410c-b682-b98b01779b8c	8a813b7b-c5b1-4ae5-bfc8-12b557e80f5f	4a940c67-c505-467c-80cd-d0581106746b	2025-12-05 00:00:00	3076.04
7934ca8c-a5f5-47e2-85f9-07af4789eb83	8a813b7b-c5b1-4ae5-bfc8-12b557e80f5f	4a940c67-c505-467c-80cd-d0581106746b	2025-12-19 00:00:00	3026.05
45893bb2-4514-4e1b-8079-60eda0d0bd19	8a813b7b-c5b1-4ae5-bfc8-12b557e80f5f	4a940c67-c505-467c-80cd-d0581106746b	2025-11-26 00:00:00	2912.64
80d95584-8ebc-46d5-8c23-c5d423c36aa1	8a813b7b-c5b1-4ae5-bfc8-12b557e80f5f	4a940c67-c505-467c-80cd-d0581106746b	2025-12-18 00:00:00	2899.82
f6a4504e-19d3-414a-87e9-7470a006c766	8a813b7b-c5b1-4ae5-bfc8-12b557e80f5f	4a940c67-c505-467c-80cd-d0581106746b	2025-12-20 00:00:00	3041.54
\.


--
-- TOC entry 4852 (class 2606 OID 17873)
-- Name: admin_users admin_users_password_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_password_key UNIQUE (password);


--
-- TOC entry 4854 (class 2606 OID 17875)
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- TOC entry 4856 (class 2606 OID 17877)
-- Name: gym_memberships gym_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gym_memberships
    ADD CONSTRAINT gym_memberships_pkey PRIMARY KEY (id);


--
-- TOC entry 4858 (class 2606 OID 17879)
-- Name: schedule schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT schedule_pkey PRIMARY KEY (id);


--
-- TOC entry 4860 (class 2606 OID 17881)
-- Name: trainer_photos trainer_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trainer_photos
    ADD CONSTRAINT trainer_photos_pkey PRIMARY KEY (id);


--
-- TOC entry 4862 (class 2606 OID 17883)
-- Name: trainers trainers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trainers
    ADD CONSTRAINT trainers_pkey PRIMARY KEY (id);


--
-- TOC entry 4864 (class 2606 OID 17885)
-- Name: training_types training_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.training_types
    ADD CONSTRAINT training_types_pkey PRIMARY KEY (id);


--
-- TOC entry 4866 (class 2606 OID 17887)
-- Name: visitor_analytics visitor_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitor_analytics
    ADD CONSTRAINT visitor_analytics_pkey PRIMARY KEY (visitor_id);


--
-- TOC entry 4868 (class 2606 OID 17889)
-- Name: visitor_memberships visitor_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitor_memberships
    ADD CONSTRAINT visitor_memberships_pkey PRIMARY KEY (id);


--
-- TOC entry 4870 (class 2606 OID 17891)
-- Name: visitor_otp visitor_otp_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitor_otp
    ADD CONSTRAINT visitor_otp_phone_number_key UNIQUE (phone_number);


--
-- TOC entry 4872 (class 2606 OID 17893)
-- Name: visitor_otp visitor_otp_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitor_otp
    ADD CONSTRAINT visitor_otp_pkey PRIMARY KEY (id);


--
-- TOC entry 4874 (class 2606 OID 17895)
-- Name: visitor_users visitor_users_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitor_users
    ADD CONSTRAINT visitor_users_phone_number_key UNIQUE (phone_number);


--
-- TOC entry 4876 (class 2606 OID 17897)
-- Name: visitor_users visitor_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitor_users
    ADD CONSTRAINT visitor_users_pkey PRIMARY KEY (id);


--
-- TOC entry 4878 (class 2606 OID 17899)
-- Name: visits visits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_pkey PRIMARY KEY (id);


--
-- TOC entry 4883 (class 2606 OID 17900)
-- Name: visitor_analytics fk_visitor_analytics_visitor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitor_analytics
    ADD CONSTRAINT fk_visitor_analytics_visitor FOREIGN KEY (visitor_id) REFERENCES public.visitor_users(id) ON DELETE CASCADE;


--
-- TOC entry 4886 (class 2606 OID 17905)
-- Name: visits fk_visits_memberships; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT fk_visits_memberships FOREIGN KEY (membership_id) REFERENCES public.gym_memberships(id) ON DELETE CASCADE;


--
-- TOC entry 4887 (class 2606 OID 17910)
-- Name: visits fk_visits_visitor_users; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT fk_visits_visitor_users FOREIGN KEY (visitor_id) REFERENCES public.visitor_users(id) ON DELETE CASCADE;


--
-- TOC entry 4879 (class 2606 OID 17915)
-- Name: schedule schedule_trainer_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT schedule_trainer_fkey FOREIGN KEY (trainer) REFERENCES public.trainers(id);


--
-- TOC entry 4880 (class 2606 OID 17920)
-- Name: schedule schedule_training_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT schedule_training_type_id_fkey FOREIGN KEY (training_type_id) REFERENCES public.training_types(id) ON DELETE CASCADE;


--
-- TOC entry 4881 (class 2606 OID 17925)
-- Name: trainer_photos trainer_photos_trainer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trainer_photos
    ADD CONSTRAINT trainer_photos_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES public.trainers(id);


--
-- TOC entry 4882 (class 2606 OID 17930)
-- Name: trainers trainers_training_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trainers
    ADD CONSTRAINT trainers_training_type_fkey FOREIGN KEY (training_type) REFERENCES public.training_types(id);


--
-- TOC entry 4884 (class 2606 OID 17935)
-- Name: visitor_memberships visitor_memberships_membership_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitor_memberships
    ADD CONSTRAINT visitor_memberships_membership_id_fkey FOREIGN KEY (membership_id) REFERENCES public.gym_memberships(id) ON DELETE CASCADE;


--
-- TOC entry 4885 (class 2606 OID 17940)
-- Name: visitor_memberships visitor_memberships_visitor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitor_memberships
    ADD CONSTRAINT visitor_memberships_visitor_id_fkey FOREIGN KEY (visitor_id) REFERENCES public.visitor_users(id) ON DELETE CASCADE;


--
-- TOC entry 5050 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2025-12-25 01:44:00

--
-- PostgreSQL database dump complete
--

\unrestrict N7b5TlJAIH65vK0fo0UCIMxqc9KvElZ8kDkK3WYxFenjdLTbQ5AWbYbLAw6ORwK

