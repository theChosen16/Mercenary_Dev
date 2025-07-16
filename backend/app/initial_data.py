"""
Script para inicializar datos de prueba en la base de datos.
"""
from typing import List

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.models.skill import Skill
from app.models.project import Project, ProjectStatus
from app.models.proposal import Proposal, ProposalStatus


def init_db(db: Session) -> None:
    """Initialize the database with test data."""
    # Create admin user if it doesn't exist
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin = User(
            email="admin@example.com",
            hashed_password=get_password_hash("admin123"),
            is_active=True,
            role=UserRole.ADMIN,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print("Created admin user:", admin.email)
    
    # Create some skills
    skills_data = [
        "Python", "JavaScript", "TypeScript", "Java", "C#", "PHP", "Ruby", "Go", "Rust",
        "Django", "Flask", "FastAPI", "Node.js", "Express", "Spring Boot", "ASP.NET",
        "React", "Vue.js", "Angular", "Svelte", "Next.js", "Nuxt.js",
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Elasticsearch",
        "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform",
        "Git", "GitHub", "GitLab", "Bitbucket", "CI/CD",
        "REST API", "GraphQL", "gRPC", "WebSocket",
        "Machine Learning", "Data Science", "Computer Vision", "NLP",
        "Agile", "Scrum", "Kanban", "DevOps", "TDD", "DDD"
    ]
    
    skills = []
    for skill_name in skills_data:
        skill = db.query(Skill).filter(Skill.name == skill_name).first()
        if not skill:
            skill = Skill(name=skill_name)
            db.add(skill)
            skills.append(skill)
    
    if skills:
        db.commit()
        for skill in skills:
            db.refresh(skill)
        print(f"Created {len(skills)} skills")
    
    # Create some test users
    test_users = [
        {
            "email": "client@example.com",
            "password": "client123",
            "role": UserRole.OFFERER,
            "full_name": "Test Client",
        },
        {
            "email": "freelancer@example.com",
            "password": "freelancer123",
            "role": UserRole.MERCENARY,
            "full_name": "Test Freelancer",
        },
    ]
    
    for user_data in test_users:
        user = db.query(User).filter(User.email == user_data["email"]).first()
        if not user:
            user = User(
                email=user_data["email"],
                hashed_password=get_password_hash(user_data["password"]),
                is_active=True,
                role=user_data["role"],
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created test user: {user.email}")
    
    # Create some test projects
    client = db.query(User).filter(User.email == "client@example.com").first()
    if client:
        # Create some projects for the client
        projects_data = [
            {
                "title": "Desarrollo de API REST con FastAPI",
                "description": "Necesito desarrollar una API REST con autenticación JWT y base de datos PostgreSQL.",
                "budget": 1500,
                "status": ProjectStatus.published,
                "skill_names": ["Python", "FastAPI", "PostgreSQL", "JWT"],
            },
            {
                "title": "Aplicación web con React y Node.js",
                "description": "Desarrollo de una aplicación web completa con frontend en React y backend en Node.js con Express.",
                "budget": 3000,
                "status": ProjectStatus.published,
                "skill_names": ["JavaScript", "React", "Node.js", "Express"],
            },
            {
                "title": "Migración de base de datos a la nube",
                "description": "Migrar una base de datos SQL Server local a Azure SQL Database.",
                "budget": 2000,
                "status": ProjectStatus.draft,
                "skill_names": ["SQL Server", "Azure", "ETL", "Data Migration"],
            },
        ]
        
        for project_data in projects_data:
            # Check if project with this title already exists
            project = db.query(Project).filter(Project.title == project_data["title"]).first()
            if not project:
                # Get skill objects
                skills = []
                for skill_name in project_data["skill_names"]:
                    skill = db.query(Skill).filter(Skill.name == skill_name).first()
                    if skill:
                        skills.append(skill)
                
                project = Project(
                    title=project_data["title"],
                    description=project_data["description"],
                    budget=project_data["budget"],
                    status=project_data["status"],
                    client_id=client.id,
                    skills=skills,
                )
                db.add(project)
                db.commit()
                db.refresh(project)
                print(f"Created project: {project.title}")
                
                # Create some proposals for the projects
                freelancer = db.query(User).filter(User.email == "freelancer@example.com").first()
                if freelancer and project.status == ProjectStatus.published:
                    proposal = Proposal(
                        cover_letter=f"Estoy interesado en trabajar en su proyecto '{project.title}'. Tengo experiencia en {', '.join(skill.name for skill in skills[:2])}.",
                        bid_amount=project.budget * 0.9,  # 10% discount
                        estimated_days=30,
                        status=ProposalStatus.pending,
                        project_id=project.id,
                        freelancer_id=freelancer.id,
                    )
                    db.add(proposal)
                    db.commit()
                    db.refresh(proposal)
                    print(f"Created proposal for project: {project.title}")


def main() -> None:
    """Main function to initialize the database."""
    print("Initializing database...")
    db = SessionLocal()
    try:
        init_db(db)
        print("Database initialized successfully!")
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
