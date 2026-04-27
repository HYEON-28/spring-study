# 데이터베이스 (RDS)

**Status:** 적용 완료 (Single-AZ)

## 인스턴스

| 항목                      | 값                                                |
| ------------------------- | ------------------------------------------------- |
| 엔진                      | MySQL                                             |
| 가용 구성                 | **Single-AZ** (월 ~$15)                           |
| 배치                      | Private Subnet(`Private-a`, `Private-b`)          |
| Subnet Group              | `Private-a` + `Private-b` (RDS는 2개 AZ 필수)     |
| Security Group            | `rds-sg` (인바운드 3306, source = `fargate-sg`만) |
| 데이터베이스(스키마) 이름 | `md-blog`                                         |
| 문자셋 / 콜레이션         | `utf8mb4` / `utf8mb4_0900_ai_ci`                  |

## Single-AZ vs Multi-AZ

| 구성      | 월 비용                            | 페일오버            |
| --------- | ---------------------------------- | ------------------- |
| Single-AZ | ~$15                               | 수동, 다운타임 발생 |
| Multi-AZ  | ~$30 (인스턴스 2배 + 스토리지 2배) | 1~2분 자동 페일오버 |

**현재 결정:** 개발 초기 단계 → Single-AZ. 매출 발생 또는 SLA 요구 발생 시 Multi-AZ 전환.

## 접속 (운영)

- 외부 인터넷 노출 없음. Public access **OFF**.
- Spring Boot(Fargate)에서만 접근. `rds-sg` 인바운드는 `fargate-sg` 만 허용.
- Spring Boot에서 환경변수로 주입:
  - `SPRING_DATASOURCE_URL` (예: `jdbc:mysql://<endpoint>:3306/md-blog?useSSL=true&serverTimezone=UTC`)
  - `SPRING_DATASOURCE_USERNAME`
  - `SPRING_DATASOURCE_PASSWORD`

## 스키마 관리

- 스키마 정의: [../db/schema.md](../db/schema.md)
- DDL 파일: `ddl/ddl.sql`
- `spring.jpa.hibernate.ddl-auto=validate` 로 운영 → 앱이 스키마를 자동 변경하지 않는다.
- 스키마 변경은 **DDL 직접 적용 후 재배포** 한다.

## DB 직접 접근 절차 (DDL 적용·운영 점검 등)

운영 환경 RDS는 Private Subnet에 있고 `rds-sg` 인바운드는 `fargate-sg` 만 허용하므로 로컬에서 직접 접근할 수 없다. 작업이 필요할 때는 **Public Subnet에 임시 Bastion EC2를 띄우고 SSH 터널을 통해 접속**한다. 작업 후 EC2를 종료하면 비용·보안 노출이 모두 0이 된다.

> 참고: "RDS Public access: Yes"로 잠깐 여는 방법은 **사용 불가**. 현재 RDS Subnet Group이 Private-a + Private-b 로만 구성돼 IGW 경로가 없어서 Public access를 켜도 외부에서 도달하지 못한다.

### 사전 요건

- 로컬에 SSH 클라이언트 (Windows: OpenSSH 또는 PuTTY)
- 로컬에 `mysql` 클라이언트 (또는 MySQL Workbench, DBeaver 등 GUI)

### 1) Bastion 전용 Security Group 생성

EC2 콘솔 → Security Groups → Create

| 항목     | 값                               |
| -------- | -------------------------------- |
| Name     | `bastion-sg`                     |
| VPC      | md-blog VPC                      |
| Inbound  | Type: SSH (22), Source:**My IP** |
| Outbound | (기본값 전체 허용)               |

### 2) `rds-sg` 에 Bastion 인바운드 추가

EC2 → Security Groups → `rds-sg` → Edit inbound rules → **Add rule** (기존 `fargate-sg` 규칙은 유지):

| 항목        | 값                                        |
| ----------- | ----------------------------------------- |
| Type        | MySQL/Aurora (3306)                       |
| Source      | `bastion-sg` (SG 참조)                    |
| Description | `temp bastion access YYYY-MM-DD <reason>` |

### 3) Bastion EC2 인스턴스 띄우기

EC2 → Launch instance

| 항목                  | 값                                              |
| --------------------- | ----------------------------------------------- |
| Name                  | `md-blog-bastion-temp`                          |
| AMI                   | Amazon Linux 2023                               |
| Instance type         | **t4g.nano** (시간당 약 $0.0042 ≈ 6원)          |
| Key pair              | 신규 생성 후`.pem` 다운로드 (또는 기존 키 사용) |
| VPC                   | md-blog VPC                                     |
| Subnet                | **Public-a**                                    |
| Auto-assign public IP | **Enable**                                      |
| Security group        | `bastion-sg`                                    |
| Storage               | 8 GB (기본)                                     |

Launch 후 1분 정도 대기, **Public IPv4 address** 메모.

### 4) 로컬에서 SSH 터널

새 터미널에서 (이 터미널은 작업 내내 유지):

```bash
ssh -i <KEY.pem> -L 13306:<RDS_ENDPOINT>:3306 ec2-user@<BASTION_PUBLIC_IP>
```

- `<RDS_ENDPOINT>`: RDS 콘솔의 Endpoint (예: `md-blog.xxxxx.ap-northeast-2.rds.amazonaws.com`)
- 첫 접속 시 `yes` 입력해서 host key 신뢰
- 윈도우 PuTTY: Connection → SSH → Tunnels → Source port: `3306`, Destination: `<RDS_ENDPOINT>:3306`, Local 추가

### 5) 다른 터미널에서 mysql 접속

```bash
mysql -h 127.0.0.1 -P 3306 -u <MASTER_USER> -p
```

`localhost:3306` → SSH 터널 → RDS 로 전달된다.

DB 최초 생성 시:

```sql
CREATE DATABASE `md-blog` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `md-blog`;
SOURCE <project-root>/ddl/ddl.sql;
SHOW TABLES;
```

`users`, `repositories` 등 테이블이 보이면 성공.

### 6) 즉시 원복 (필수)

작업 직후, 같은 세션 안에서 마무리한다:

- 터널 SSH 세션 종료 (`exit` 또는 Ctrl+D)
- EC2 콘솔 → `md-blog-bastion-temp` 인스턴스 → **Instance state → Terminate instance**
- EC2 → Security Groups → `rds-sg` → 방금 추가한 `bastion-sg` 인바운드 규칙 **삭제**
- (선택) `bastion-sg` 자체도 삭제. 다음에 또 쓸 거면 유지해도 무방
- 작업 시점·내용·완료 여부를 운영 노트(또는 PR)에 기록

> ⚠️ EC2를 Terminate 하지 않으면 시간당 요금이 계속 발생하고, `rds-sg`에 Bastion 허용 규칙이 남아 있으면 잠재적 침투 경로가 된다. **EC2 Terminate + SG 규칙 삭제** 두 단계를 한 세션 안에서 끝낸다. 자리를 떠야 하면 작업을 시작하지 않는다.

## 향후 개선

- **AWS Systems Manager Session Manager + EC2 Instance Connect**: SSH 키 관리 없이 IAM 권한으로 Bastion에 접근. 운영 점검이 잦아지면 도입.
- **DB Migration 도구**: Flyway/Liquibase 도입해서 DDL 적용을 빌드/배포 파이프라인에 포함. 수동 DDL 작업 자체를 줄임.
