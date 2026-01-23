import sys
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.prompt import Prompt
from ..database.db_manager import DBManager
from ..ai_engine.groq_client import GroqSchedulerAI
from ..scheduler.logic import SchedulerEngine

console = Console()

class CLI:
    def __init__(self):
        self.db = DBManager()
        self.ai = GroqSchedulerAI()
        self.engine = SchedulerEngine(self.db, self.ai)

    def start(self):
        console.print(Panel.fit("[bold magenta]AI-Powered Smart Scheduler[/bold magenta]\n[green]Welcome! I am your work-life balance assistant.[/green]", border_style="magenta"))
        
        while True:
            choice = Prompt.ask("\n[bold cyan]What would you like to do?[/bold cyan] (type 'help' for options)", default="chat")
            
            if choice == "exit":
                console.print("[yellow]Goodbye![/yellow]")
                sys.exit(0)
            elif choice == "help":
                self.show_help()
            elif choice == "list employees":
                self.list_employees()
            elif choice == "add employee":
                self.add_employee_interactive()
            elif choice == "view schedule":
                self.view_schedule()
            elif choice == "chat":
                self.chat_loop()
            elif choice == "generate schedule": # Shortcut if they know what they want
                self.generate_schedule_interactive()
            elif choice == "add task":
                self.add_task_interactive()
            else:
                # Treat as natural language input or chat
                response = self.engine.add_task_from_natural_language(choice)
                console.print(f"[green]AI:[/green] {response}")

    def show_help(self):
        table = Table(title="Available Commands")
        table.add_column("Command", style="cyan")
        table.add_column("Description", style="white")
        table.add_row("list employees", "View all team members")
        table.add_row("add employee", "Add a new team member")
        table.add_row("add task", "Add a new task manually")
        table.add_row("view schedule", "View generated schedules")
        table.add_row("generate schedule", "Create a new schedule based on pending tasks")
        table.add_row("chat", "Enter conversation mode (default)")
        table.add_row("exit", "Exit the application")
        console.print(table)

    def list_employees(self):
        employees = self.db.get_all_employees()
        if not employees:
            console.print("[yellow]No employees found.[/yellow]")
            return

        table = Table(title="Team Members")
        table.add_column("ID", style="dim")
        table.add_column("Name", style="bold")
        table.add_column("Role")
        table.add_column("Weekly Limit")
        
        for emp in employees:
            table.add_row(str(emp.id), emp.name, emp.role, str(emp.weekly_hours_limit))
            
        console.print(table)

    def add_employee_interactive(self):
        name = Prompt.ask("Name")
        role = Prompt.ask("Role")
        email = Prompt.ask("Email")
        limit = Prompt.ask("Weekly Hours Limit", default="40")
        
        self.db.add_employee(name, role, email, int(limit))
        console.print(f"[green]Added employee {name} successfully![/green]")

    def add_task_interactive(self):
        title = Prompt.ask("Task Title")
        description = Prompt.ask("Description", default="")
        priority = Prompt.ask("Priority (High/Medium/Low)", default="Medium")
        hours = Prompt.ask("Estimated Hours", default="1.0")
        deadline = Prompt.ask("Deadline (YYYY-MM-DD or Day)", default="Friday")
        
        self.db.add_task(title, description, priority, float(hours), deadline)
        console.print(f"[green]Added task '{title}' successfully![/green]")

    def chat_loop(self):
        console.print("[dim]Entering chat mode. Type 'back' to return to main menu.[/dim]")
        while True:
            user_input = Prompt.ask("[bold green]You[/bold green]")
            if user_input.lower() == 'back':
                break
            
            # Here we can handle both task addition and general queries
            response = self.engine.add_task_from_natural_language(user_input)
            console.print(f"[blue]AI:[/blue] {response}")

    def generate_schedule_interactive(self):
        console.print("[dim]Generating schedule...[/dim]")
        constraints = Prompt.ask("Any specific constraints for this week? (e.g. 'No meetings on Friday')", default="")
        result = self.engine.generate_and_save_schedule(constraints)
        
        if isinstance(result, dict) and "error" in result:
             console.print(f"[red]Error:[/red] {result['error']}")
        elif result:
            console.print(f"[green]Successfully scheduled {len(result)} tasks![/green]")
            self.view_schedule() # Show it immediately
        else:
            console.print("[yellow]No tasks planned or unable to schedule.[/yellow]")
            console.print("[dim]Tip: Use 'add task' or type a natural language command like 'Add a task to write report' first.[/dim]")

    def view_schedule(self):
        # This needs a get_schedule method in DBManager which we haven't explicitly added a 'get all' for, 
        # let's assume we want to see everything or filter. For now, let's just query directly or add a method.
        # I'll add a quick query here using the connection context from DBManager but usually should be in DBManager.
        # For strictness, let's add it to DBManager or just query locally if we exported connection. 
        # BUT DBManager has get_connection.
        
        query = """
        SELECT s.scheduled_day, s.start_time, s.end_time, e.name as emp_name, t.title as task_title, s.task_id
        FROM schedules s
        JOIN employees e ON s.employee_id = e.id
        JOIN tasks t ON s.task_id = t.id
        ORDER BY s.scheduled_day, s.start_time
        """
        
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query)
            rows = cursor.fetchall()
            
        if not rows:
            console.print("[yellow]No scheduled tasks found.[/yellow]")
            return

        table = Table(title="Weekly Schedule")
        table.add_column("Day", style="cyan")
        table.add_column("Time", style="green")
        table.add_column("Employee", style="bold white")
        table.add_column("Task ID", style="dim")
        table.add_column("Task", style="yellow")
        
        for row in rows:
            table.add_row(row["scheduled_day"], f"{row['start_time']} - {row['end_time']}", row["emp_name"], str(row.get("task_id", "?")), row["task_title"])
            
        console.print(table)

if __name__ == "__main__":
    app = CLI()
    app.start()
