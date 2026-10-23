import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { PageHeader } from "@/components/shared/page-header";
import { ActionForm } from "@/components/shared/action-form";
import { FormField } from "@/components/shared/form-field";
import { OptionSelect, type SelectOption } from "@/components/shared/option-select";
import { SubmitButton } from "@/components/shared/submit-button";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getMyGoals, getMyReviews, getTeamGoals, getTeamReviews } from "@/features/performance/queries";
import { createGoal, createPerformanceReview } from "@/features/performance/actions";
import { getVisibleEmployeeSelectOptions } from "@/features/employees/select-options";
import { GoalList } from "@/features/performance/components/goal-list";
import { ReviewList } from "@/features/performance/components/review-list";

async function MyPerformanceSection({ employeeId }: { employeeId: string }) {
  const [myGoals, myReviews] = await Promise.all([getMyGoals(employeeId), getMyReviews(employeeId)]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>My goals</CardTitle>
        </CardHeader>
        <CardContent>
          <GoalList goals={myGoals} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>My reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewList reviews={myReviews} />
        </CardContent>
      </Card>
    </div>
  );
}

async function TeamPerformanceSection({ user }: { user: CurrentUser }) {
  const [teamGoals, teamReviews, allVisibleEmployees] = await Promise.all([
    getTeamGoals(user),
    getTeamReviews(user),
    getVisibleEmployeeSelectOptions(user),
  ]);
  // Nobody sets goals for or reviews themselves.
  const teamOptions: SelectOption[] = allVisibleEmployees.filter((option) => option.value !== user.employee?.id);

  return (
    <div className="grid gap-6">
      <h2 className="text-lg font-semibold">Team</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Set a goal</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionForm action={createGoal} resetOnSuccess className="grid gap-4">
              <FormField label="Employee" htmlFor="goalEmployeeId">
                <OptionSelect id="goalEmployeeId" name="employeeId" options={teamOptions} placeholder="Select an employee" required />
              </FormField>
              <FormField label="Goal" htmlFor="title">
                <Input id="title" name="title" placeholder="e.g. Reduce hiring time to 20 days" required />
              </FormField>
              <FormField label="Details" htmlFor="description">
                <Textarea id="description" name="description" />
              </FormField>
              <FormField label="Due date" htmlFor="dueDate">
                <Input id="dueDate" name="dueDate" type="date" />
              </FormField>
              <SubmitButton>Add goal</SubmitButton>
            </ActionForm>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Write a review</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionForm action={createPerformanceReview} resetOnSuccess className="grid gap-4">
              <FormField label="Employee" htmlFor="reviewEmployeeId">
                <OptionSelect id="reviewEmployeeId" name="employeeId" options={teamOptions} placeholder="Select an employee" required />
              </FormField>
              <FormField label="Period" htmlFor="period">
                <Input id="period" name="period" placeholder="e.g. 2026 H2" required />
              </FormField>
              <FormField label="Rating" htmlFor="rating">
                <NativeSelect id="rating" name="rating" defaultValue="3" className="w-full">
                  <NativeSelectOption value="5">5 · Outstanding</NativeSelectOption>
                  <NativeSelectOption value="4">4 · Exceeds expectations</NativeSelectOption>
                  <NativeSelectOption value="3">3 · Meets expectations</NativeSelectOption>
                  <NativeSelectOption value="2">2 · Needs improvement</NativeSelectOption>
                  <NativeSelectOption value="1">1 · Unsatisfactory</NativeSelectOption>
                </NativeSelect>
              </FormField>
              <FormField label="Comments" htmlFor="comments">
                <Textarea id="comments" name="comments" />
              </FormField>
              <SubmitButton>Save review</SubmitButton>
            </ActionForm>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team goals</CardTitle>
          </CardHeader>
          <CardContent>
            <GoalList goals={teamGoals} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewList reviews={teamReviews} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default async function PerformancePage() {
  const currentUser = await getCurrentUser();
  const canManagePerformance = hasPermission(currentUser.role, "performance:manage");

  return (
    <>
      <PageHeader title="Goals & reviews" description="Track goals and see performance reviews." />
      <div className="grid gap-8">
        {currentUser.employee && <MyPerformanceSection employeeId={currentUser.employee.id} />}
        {canManagePerformance && <TeamPerformanceSection user={currentUser} />}
      </div>
    </>
  );
}
