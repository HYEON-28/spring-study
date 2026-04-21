# Infra 적용 과정

## 도메인 설정

1. 도메인 구매 -> md-blog.org
2. Route 53: Hosted Zone 등록, 네임서버 설정

## VPC, 서브넷 설정 (완료)

public vpc 2개 (ALB만, ALB Multi-AZ 필수라 2개 사용)
private vpc 2개 (Fargate, RDS, Redis 전부)
AZ장애 대비, RDS생성을 위해 서브넷 최소 2개 필요

```
VPC         10.0.0.0/16

서브넷: 4개
Public-a    10.0.1.0/24   ALB + NAT Gateway 1개
Public-b    10.0.2.0/24   ALB (AZ-b)
Private-a   10.0.11.0/24  Fargate + RDS + Redis (AZ-a)
Private-b   10.0.12.0/24  Fargate + RDS + Redis (AZ-b)
```

## NAT Gateway (일단 보류)

private 서브넷에서 인터넷 접근하기 위한 통로
프록시와 거의 같은 역할을 함.
요청을 보내고, 받을 때 NAT Gateway의 공인 IP주소로 private 서비스의 사설 IP를 바꿔치기 해준다.

- 단점: 비용(시간당요금 + 데이터처리요금) 월 최소 $42
- 시간당요금: $0.059 _ 24시간 _ 30일 = ~$42/월
- 데이터 처리: $0.059/GB
- 결론: 서비스 초기에는 Fargate를 public subnet에 두고, 서비스 수익이 나고 안정화 되면 private subnet으로 옮기기.
- Fargate와 RDS간의 통신은 VPC내부 통신이라 local라우팅으로 처리됨. NAT 필요없음

## Internet Gateway

퍼블릭 인터넷과 통신하기 위해 반드시 필요한 서비스.

- VPC와 연결함
- public 서브넷용 라우팅 테이블에 0.0.0.0/0 -> IGW 규칙 추가

## 라우팅 테이블

나가는 패킷에 대한 네비게이션

- public 서브넷: 10.0.0.0/16 -> local, 0.0.0.0/0 -> IGW
- private 서브넷: 10.0.0.0/16 -> local

## Security Group (보안 그룹) 생성

AWS 리소스 단위의 가상 방화벽
어떤 트래픽을 "허용"할지 제어함

- alb security group: 0.0.0.0/0 에서 80/443 허용 (인터넷 어느IP나 HTTP, HTTPS 접속 허용)
- fargate security group: alb-sg에서 앱 포트(예: 8080만 허용)
- rds security group: fargate-sg에서 3306만 허용

## DB 설정

### Single-AZ vs Multi-AZ

RDS MySQL Single-AZ

- 월 비용: 최소 ~$15

RDS MySQL Multi-AZ

- 다른 AZ에 Standby 복제본 유지, 기본 인스턴스 장애 시 1~2분 이내에 자동 페일오버
- 월 비용: 최소 ~$30 (인스턴스비용 2배, 스토리지비용 2배)

-> 개발 초기단계이므로 Single-AZ 선택

### Subnet Group 생성

RDS 인스턴스를 어느 AZ(가용영역)의 어떤 서브넷이 둘지 정의함 (RDS는 복수의 가용영역이 필요하기 때문)
보통 Private Subnet만 포함함
